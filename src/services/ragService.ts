import { CampusDocument } from '../types';
import { academicService } from './academicService';

export interface RAGChunk {
  docId: string;
  docTitle: string;
  category: string;
  text: string;
  score: number;
}

export const ragService = {
  /**
   * Retrieves relevant campus knowledge chunks based on query matching.
   */
  async retrieveContext(query: string, department?: string): Promise<{ contextText: string; sources: string[] }> {
    const docs: CampusDocument[] = await academicService.getCampusDocuments(department);
    if (!docs || docs.length === 0) {
      return { contextText: '', sources: [] };
    }

    const qLower = query.toLowerCase();
    const queryTokens = qLower.split(/\W+/).filter(t => t.length > 2);

    const scoredChunks: RAGChunk[] = [];

    docs.forEach(doc => {
      // Split content into paragraphs / sections
      const paragraphs = doc.content.split(/\n\n|\n(?=\d+\.)/);
      paragraphs.forEach(paragraph => {
        if (!paragraph.trim()) return;
        const pLower = paragraph.toLowerCase();
        let matchScore = 0;

        queryTokens.forEach(token => {
          if (pLower.includes(token)) {
            matchScore += 2;
          }
        });

        if (pLower.includes(qLower)) matchScore += 10;
        if (doc.title.toLowerCase().includes(qLower)) matchScore += 5;

        if (matchScore > 0) {
          scoredChunks.push({
            docId: doc.id,
            docTitle: doc.title,
            category: doc.category,
            text: paragraph.trim(),
            score: matchScore
          });
        }
      });
    });

    // Sort by score descending and pick top 3
    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 3);

    if (topChunks.length === 0) {
      return { contextText: '', sources: [] };
    }

    const contextParts = topChunks.map(
      c => `[Source: Official Campus Document - "${c.docTitle}" (${c.category})]\n${c.text}`
    );
    const sources = Array.from(new Set(topChunks.map(c => `${c.docTitle} (${c.category})`)));

    return {
      contextText: contextParts.join('\n\n'),
      sources
    };
  }
};
