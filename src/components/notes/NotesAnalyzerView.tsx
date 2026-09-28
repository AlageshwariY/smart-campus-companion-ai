import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, BookOpen, CheckCircle, HelpCircle, Layers, RotateCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { academicService } from '../../services/academicService';
import { aiService } from '../../services/aiService';
import { StudyMaterial, NotesAnalysisResult, Flashcard, QuizQuestion } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const NotesAnalyzerView: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>(
    `DATABASE NORMALIZATION & CONCURRENCY CONTROL:
Normalization organizes database tables to prevent insert, update, and delete anomalies.
1NF requires atomic values and no repeating groups.
2NF requires 1NF and no partial dependencies on composite primary keys.
3NF eliminates transitive dependencies (X -> Y and Y -> Z where Z is non-prime).
BCNF (Boyce-Codd Normal Form) is a stricter 3NF where every determinant X -> Y must be a candidate key.

Concurrency Control:
ACID properties guarantee reliable database transactions: Atomicity, Consistency, Isolation, and Durability.
Lock-based protocols use Shared (S) and Exclusive (X) locks. Two-Phase Locking (2PL) has Growing Phase and Shrinking Phase.
Deadlocks occur during circular waits. Prevention uses Banker's Algorithm or Wait-Die/Wound-Wait schemes.`
  );
  const [documentTitle, setDocumentTitle] = useState<string>('DBMS Normalization & Concurrency Notes');
  const [analysis, setAnalysis] = useState<NotesAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz' | 'topics'>('summary');

  // Flashcards state
  const [currentFcIndex, setCurrentFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    async function loadMaterials() {
      if (!user) return;
      const data = await academicService.getMaterials(user.department, user.year);
      setMaterials(data);
    }
    loadMaterials();
  }, [user]);

  const handleRunAnalysis = async (action: 'summarize' | 'explain' | 'quiz' | 'flashcards' | 'topics') => {
    if (!noteContent.trim()) return;
    setAnalyzing(true);
    try {
      const res = await aiService.analyzeDocument(noteContent, documentTitle, action);
      setAnalysis(res);
      if (action === 'flashcards') setActiveTab('flashcards');
      else if (action === 'quiz') setActiveTab('quiz');
      else if (action === 'topics') setActiveTab('topics');
      else setActiveTab('summary');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectMaterial = (mat: StudyMaterial) => {
    setSelectedMaterialId(mat.id);
    setDocumentTitle(mat.title);
    setNoteContent(`[Study Hub Material: ${mat.title}]\nSubject: ${mat.subject_name}\nDescription: ${mat.description}\nFile URL: ${mat.file_url}`);
  };

  const calculateQuizScore = () => {
    if (!analysis) return 0;
    let correct = 0;
    analysis.quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) correct++;
    });
    return correct;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest flex items-center gap-1.5 w-fit mb-2">
            <Sparkles className="w-3 h-3 text-amber-300" /> AI Document & PDF Workspace
          </span>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-400" /> AI Notes & Lecture Document Analyzer
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Upload PDFs, lecture slides, or paste notes to instantly generate summaries, flashcards, MCQs, and topic outlines.
          </p>
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Note Input & Document Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" /> Select Study Hub Material
              </h3>
            </div>

            {materials.length > 0 && (
              <select
                value={selectedMaterialId}
                onChange={(e) => {
                  const m = materials.find(x => x.id === e.target.value);
                  if (m) handleSelectMaterial(m);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="">-- Or Select Material from Study Hub --</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.subject_name}: {m.title}</option>
                ))}
              </select>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Document Title</label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Lecture Text / Notes Content</label>
              <textarea
                rows={10}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Paste lecture text, chapter notes, or PDF content here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Quick Action Trigger Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => handleRunAnalysis('summarize')}
                disabled={analyzing}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Summarize
              </button>
              <button
                onClick={() => handleRunAnalysis('explain')}
                disabled={analyzing}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/20"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Explain
              </button>
              <button
                onClick={() => handleRunAnalysis('flashcards')}
                disabled={analyzing}
                className="px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-pink-600/20"
              >
                <Layers className="w-3.5 h-3.5" /> Flashcards
              </button>
              <button
                onClick={() => handleRunAnalysis('quiz')}
                disabled={analyzing}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Quiz MCQs
              </button>
              <button
                onClick={() => handleRunAnalysis('topics')}
                disabled={analyzing}
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/20 col-span-2 sm:col-span-2"
              >
                <BookOpen className="w-3.5 h-3.5" /> Extract Topics
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Result Workspace (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 min-h-[460px] flex flex-col justify-between">
            {analyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-indigo-400 animate-spin" />
                <p className="text-xs text-slate-300 font-semibold">Processing lecture document & generating structured AI insights...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                {/* Result Mode Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'summary' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    Summary & Explanation
                  </button>
                  <button
                    onClick={() => setActiveTab('flashcards')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'flashcards' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    Flashcards ({analysis.flashcards.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'quiz' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    Interactive Quiz ({analysis.quiz.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('topics')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'topics' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    Key Topics
                  </button>
                </div>

                {/* Tab Content: Summary */}
                {activeTab === 'summary' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">AI Summary</h4>
                      <p className="text-xs text-slate-200 leading-relaxed">{analysis.summary}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Concept Breakdown</h4>
                      <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{analysis.explanation}</div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Flashcards Widget */}
                {activeTab === 'flashcards' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Card {currentFcIndex + 1} of {analysis.flashcards.length}</span>
                      <span>Click card to flip</span>
                    </div>

                    {analysis.flashcards.length > 0 && (
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className={`min-h-[220px] glass-panel p-8 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center transition-all transform hover:scale-[1.01] ${
                          isFlipped ? 'border-pink-500/50 bg-pink-950/20' : 'border-indigo-500/40 bg-indigo-950/20'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                          {isFlipped ? 'Answer Side' : 'Question Side'}
                        </span>
                        <p className="text-sm font-bold text-slate-100 leading-relaxed">
                          {isFlipped ? analysis.flashcards[currentFcIndex].back : analysis.flashcards[currentFcIndex].front}
                        </p>
                        <span className="text-[11px] text-indigo-400 font-semibold mt-4 flex items-center gap-1">
                          <RotateCw className="w-3.5 h-3.5" /> Tap to flip
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentFcIndex((prev) => (prev > 0 ? prev - 1 : analysis.flashcards.length - 1));
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white"
                      >
                        &larr; Previous Card
                      </button>
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentFcIndex((prev) => (prev < analysis.flashcards.length - 1 ? prev + 1 : 0));
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
                      >
                        Next Card &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab Content: Quiz */}
                {activeTab === 'quiz' && (
                  <div className="space-y-4 animate-fadeIn">
                    {analysis.quiz.map((q, idx) => (
                      <div key={q.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                        <h4 className="text-xs font-bold text-slate-100">{idx + 1}. {q.question}</h4>
                        <div className="space-y-1.5">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = quizAnswers[q.id] === oIdx;
                            const isCorrect = oIdx === q.correctIndex;
                            let style = 'bg-slate-900 text-slate-300 border-slate-800';
                            if (quizSubmitted) {
                              if (isCorrect) style = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                              else if (isSelected && !isCorrect) style = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                            } else if (isSelected) {
                              style = 'bg-indigo-600 text-white border-indigo-500';
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => {
                                  if (!quizSubmitted) {
                                    setQuizAnswers(prev => ({ ...prev, [q.id]: oIdx }));
                                  }
                                }}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${style}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                            💡 <strong>Explanation:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}

                    <div className="pt-2 flex justify-between items-center">
                      {!quizSubmitted ? (
                        <button
                          onClick={() => setQuizSubmitted(true)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                        >
                          Submit Quiz Answers
                        </button>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-emerald-400">
                            Score: {calculateQuizScore()} / {analysis.quiz.length} Correct
                          </span>
                          <button
                            onClick={() => {
                              setQuizSubmitted(false);
                              setQuizAnswers({});
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
                          >
                            Retake Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab Content: Key Topics */}
                {activeTab === 'topics' && (
                  <div className="space-y-3 animate-fadeIn">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Extracted High-Yield Exam Topics</h4>
                    <div className="space-y-2">
                      {analysis.key_topics.map((topic, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                            #{idx + 1}
                          </span>
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-200">No Document Analysis Executed</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Enter or select notes on the left and click Summarize, Explain, Quiz, or Flashcards to analyze.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
