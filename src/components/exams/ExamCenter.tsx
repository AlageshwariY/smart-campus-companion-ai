import React, { useState, useEffect } from 'react';
import { GraduationCap, Clock, MapPin, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import { academicService } from '../../services/academicService';
import { Exam, ExamCategory } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const ExamCenter: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToTable } = useRealtime();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<ExamCategory | 'All'>('All');

  const loadExams = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await academicService.getExams(user.department, user.year);
      setExams(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
    const unsub = subscribeToTable('exams', () => loadExams());
    return () => unsub();
  }, [user]);

  if (loading) return <SkeletonLoader count={3} height="h-28" />;

  const filteredExams = exams.filter(e => activeCategory === 'All' || e.category === activeCategory);

  // Spotlight Next Exam
  const upcomingExams = exams.filter(e => new Date(e.exam_date).getTime() >= new Date().setHours(0,0,0,0));
  const nextExam = upcomingExams.length > 0 ? upcomingExams[0] : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-400" />
            Exam Center & Schedule
          </h2>
          <p className="text-xs text-slate-400 mt-1">Official examination schedules and hall allocations</p>
        </div>
        <button
          onClick={loadExams}
          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 self-start sm:self-center transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Exams
        </button>
      </div>

      {/* UPCOMING EXAM SPOTLIGHT CARD */}
      {nextExam && (
        <div className="glass-card p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/60 relative overflow-hidden">
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '5s' }} />
            <span>Spotlight &bull; Next Examination</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {nextExam.category}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{nextExam.subject_name}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-100">{nextExam.title}</h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-3">
                <span className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Calendar className="w-4 h-4" /> {nextExam.exam_date}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-indigo-300">
                  <Clock className="w-4 h-4" /> {nextExam.start_time} - {nextExam.end_time}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <MapPin className="w-4 h-4" /> Venue: {nextExam.room}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/20 text-center shrink-0">
              <span className="text-2xl font-black text-purple-400">
                {Math.max(0, Math.ceil((new Date(nextExam.exam_date).getTime() - Date.now()) / 86400000))}
              </span>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Days Remaining</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {(['All', 'Internal', 'Model', 'Semester'] as const).map((cat) => {
          const count = exams.filter(e => cat === 'All' || e.category === cat).length;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                isActive 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Exams Schedule Table / Cards */}
      {filteredExams.length === 0 ? (
        <EmptyState
          title="No Upcoming Exams"
          message={`No exams found under category '${activeCategory}'.`}
          icon={<GraduationCap className="w-12 h-12 text-slate-500" />}
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Exam Title</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Room / Venue</th>
                  <th className="px-6 py-3">Max Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {exam.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-100">{exam.title}</td>
                    <td className="px-6 py-4 text-slate-400">{exam.subject_name}</td>
                    <td className="px-6 py-4 font-mono">
                      <div className="flex flex-col">
                        <span className="font-bold text-amber-400">{exam.exam_date}</span>
                        <span className="text-[11px] text-slate-400">{exam.start_time} - {exam.end_time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">{exam.room}</td>
                    <td className="px-6 py-4 font-mono font-bold">{exam.max_marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
