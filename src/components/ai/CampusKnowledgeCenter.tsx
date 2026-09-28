import React, { useState, useEffect } from 'react';
import { Library, Search, Plus, BookOpen, FileText, CheckCircle, ShieldCheck, Tag, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { academicService } from '../../services/academicService';
import { ragService } from '../../services/ragService';
import { CampusDocument, CampusDocCategory } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const CampusKnowledgeCenter: React.FC = () => {
  const { user, role } = useAuth();
  const [documents, setDocuments] = useState<CampusDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CampusDocCategory | 'All'>('All');

  // Search RAG test output
  const [ragOutput, setRagOutput] = useState<{ contextText: string; sources: string[] } | null>(null);

  // Admin document create modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CampusDocCategory>('Regulation');
  const [newDept, setNewDept] = useState('All');
  const [newContent, setNewContent] = useState('');

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await academicService.getCampusDocuments(user?.department);
      setDocuments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [user]);

  const handleTestRAGSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setRagOutput(null);
      return;
    }
    const res = await ragService.retrieveContext(query, user?.department);
    setRagOutput(res);
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    await academicService.createCampusDocument({
      title: newTitle,
      category: newCategory,
      department: newDept,
      content: newContent,
      uploaded_by: user?.id
    });
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
    loadDocs();
  };

  const handleDeleteDocument = async (id: string) => {
    await academicService.deleteCampusDocument(id);
    loadDocs();
  };

  if (loading) return <SkeletonLoader count={4} height="h-36" />;

  const filteredDocs = documents.filter(d => {
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest flex items-center gap-1.5 w-fit mb-2">
            <Library className="w-3 h-3 text-indigo-400" /> RAG Knowledge Index Engine
          </span>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            Campus Knowledge & Document System
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Official college regulations, syllabus, academic calendar, exam policies, handbook, and department guides.
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Index Campus Document
          </button>
        )}
      </div>

      {/* RAG Search Bar */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleTestRAGSearch(e.target.value)}
            placeholder="Search campus rules, syllabus, attendance policy, placement guidelines, lab locations..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {['All', 'Regulation', 'Syllabus', 'Academic Calendar', 'Exam Policy', 'Placement', 'Handbook', 'Notice'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* RAG Retrieved Context Banner if active */}
      {ragOutput && ragOutput.sources.length > 0 && (
        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 animate-fadeIn">
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Retrieved Campus Knowledge Match
          </h4>
          <p className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">{ragOutput.contextText}</p>
          <div className="pt-2 flex items-center gap-2 text-[10px] text-indigo-300 font-semibold">
            <span>Sources:</span>
            {ragOutput.sources.map((s, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {doc.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">{doc.department}</span>
                  {role === 'admin' && (
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-100">{doc.title}</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap line-clamp-6">{doc.content}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between items-center">
              <span>Official Indexed Document</span>
              <span>{new Date(doc.created_at || '').toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 w-full max-w-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Index Official Campus Document into RAG Knowledge Base</h3>
            <form onSubmit={handleCreateDocument} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 2026 Examination Grading & Revaluation Rules..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="Regulation">Regulation</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Academic Calendar">Academic Calendar</option>
                    <option value="Exam Policy">Exam Policy</option>
                    <option value="Placement">Placement Policy</option>
                    <option value="Handbook">Handbook</option>
                    <option value="Notice">Notice</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="All">All Departments</option>
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Information Technology">IT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Document Text Content</label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste official policy clauses, syllabus topics, or regulation guidelines..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Index Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
