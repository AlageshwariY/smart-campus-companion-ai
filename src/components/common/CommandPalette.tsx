import React, { useState, useEffect } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  BrainCircuit, 
  FileCheck, 
  Briefcase, 
  Building2, 
  Library, 
  X 
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
          // trigger handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'dashboard', label: 'Dashboard Overview', category: 'Navigation', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance & Calculator', category: 'Academic', icon: CheckCircle2 },
    { id: 'timetable', label: 'Lecture Timetable Schedule', category: 'Academic', icon: Calendar },
    { id: 'assignments', label: 'Assignments Manager', category: 'Academic', icon: FileText },
    { id: 'exams', label: 'Exam Center & Countdown', category: 'Academic', icon: GraduationCap },
    { id: 'planner', label: 'AI Study Planner', category: 'AI Tools', icon: BrainCircuit, badge: 'AI' },
    { id: 'notes', label: 'AI Notes & PDF Analyzer', category: 'AI Tools', icon: FileCheck, badge: 'AI' },
    { id: 'career', label: 'Career & Placement AI', category: 'AI Tools', icon: Briefcase, badge: 'AI' },
    { id: 'ai', label: 'Campus AI Assistant Chat', category: 'AI Tools', icon: Sparkles, badge: 'AI' },
    { id: 'knowledge', label: 'Campus RAG Knowledge Base', category: 'Information', icon: Library },
    { id: 'services', label: 'Campus Services & Directory', category: 'Information', icon: Building2 },
    { id: 'materials', label: 'Study Hub Materials', category: 'Academic', icon: BookOpen }
  ];

  const filtered = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fadeIn">
      <div 
        className="glass-panel w-full max-w-xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search feature (e.g. attendance, study plan, career)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No matching commands found.</p>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigateTab(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-transparent text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white">{item.label}</h4>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Use <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] text-slate-300">Ctrl + K</kbd> to open anytime</span>
          <span>Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] text-slate-300">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
