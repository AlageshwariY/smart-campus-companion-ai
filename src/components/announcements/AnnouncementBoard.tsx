import React, { useState, useEffect } from 'react';
import { Megaphone, AlertTriangle, Info, Bell, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import { academicService } from '../../services/academicService';
import { Announcement, AnnouncementPriority } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const AnnouncementBoard: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToTable } = useRealtime();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [priorityFilter, setPriorityFilter] = useState<AnnouncementPriority | 'All'>('All');

  const loadAnnouncements = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await academicService.getAnnouncements(user.department, user.year);
      setAnnouncements(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    const unsub = subscribeToTable('announcements', () => loadAnnouncements());
    return () => unsub();
  }, [user]);

  if (loading) return <SkeletonLoader count={3} height="h-28" />;

  const filteredAnnouncements = announcements.filter(a => priorityFilter === 'All' || a.priority === priorityFilter);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-400" />
            Campus Notice Board
          </h2>
          <p className="text-xs text-slate-400 mt-1">Official circulars, urgent alerts, and department notices</p>
        </div>
        <button
          onClick={loadAnnouncements}
          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 self-start sm:self-center transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Board
        </button>
      </div>

      {/* Priority Filter Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {(['All', 'Urgent', 'Important', 'Normal'] as const).map((p) => {
          const count = announcements.filter(a => p === 'All' || a.priority === p).length;
          const isActive = priorityFilter === p;

          return (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                isActive 
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' 
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{p}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          title="No Announcements"
          message="No active campus announcements match your selected filter."
          icon={<Megaphone className="w-12 h-12 text-slate-500" />}
        />
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => {
            const priorityBadge = ann.priority === 'Urgent'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              : ann.priority === 'Important'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700';

            return (
              <div
                key={ann.id}
                className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${priorityBadge}`}>
                      {ann.priority}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Target: {ann.department} ({ann.year})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(ann.created_at || '').toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{ann.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{ann.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
