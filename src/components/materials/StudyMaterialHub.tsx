import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Download, ExternalLink, FileText, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import { academicService } from '../../services/academicService';
import { StudyMaterial, MaterialFileType } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const StudyMaterialHub: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToTable } = useRealtime();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedFileType, setSelectedFileType] = useState<MaterialFileType | 'All'>('All');

  const loadMaterials = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await academicService.getMaterials(user.department, user.year);
      setMaterials(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
    const unsub = subscribeToTable('materials', () => loadMaterials());
    return () => unsub();
  }, [user]);

  if (loading) return <SkeletonLoader count={4} height="h-32" />;

  // Dynamic filter lists
  const subjectList = ['All', ...Array.from(new Set(materials.map(m => m.subject_name)))];

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.subject_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || m.subject_name === selectedSubject;
    const matchesType = selectedFileType === 'All' || m.file_type === selectedFileType;
    return matchesSearch && matchesSubject && matchesType;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Study Material Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">Access lecture notes, reference PDFs, PPT slides, and code guides</p>
        </div>
        <button
          onClick={loadMaterials}
          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 self-start sm:self-center transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Hub
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, topics, guides..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full md:w-48 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
          >
            {subjectList.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>
            ))}
          </select>

          {/* File Type Filter */}
          <select
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value as any)}
            className="w-full md:w-36 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
          >
            <option value="All">All Types</option>
            <option value="PDF">PDF Documents</option>
            <option value="PPT">PPT Presentations</option>
            <option value="DOCX">Word Docs</option>
            <option value="ZIP">ZIP Archives</option>
            <option value="LINK">External Links</option>
          </select>
        </div>
      </div>

      {/* Material Grid */}
      {filteredMaterials.length === 0 ? (
        <EmptyState
          title="No Study Materials Available"
          message="No matching study resources found for your selected query or filters."
          icon={<BookOpen className="w-12 h-12 text-slate-500" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((mat) => {
            const badgeColor = mat.file_type === 'PDF' 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
              : mat.file_type === 'PPT' 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';

            return (
              <div
                key={mat.id}
                className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{mat.subject_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${badgeColor}`}>
                      {mat.file_type}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 leading-snug">{mat.title}</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{mat.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">{new Date(mat.created_at || '').toLocaleDateString()}</span>
                  <a
                    href={mat.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Open File
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
