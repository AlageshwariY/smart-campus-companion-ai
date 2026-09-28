import React, { useState, useEffect } from 'react';
import { BrainCircuit, Clock, CheckCircle2, RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { academicService } from '../../services/academicService';
import { aiService } from '../../services/aiService';
import { StudyPlan, StudyPlanSession, Subject } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const AIStudyPlannerView: React.FC = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Input states
  const [availableHours, setAvailableHours] = useState<number>(3);
  const [preferredTime, setPreferredTime] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Evening');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const loadPlannerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [existingPlan, allSubjects] = await Promise.all([
        academicService.getStudyPlan(user.id),
        academicService.getSubjects()
      ]);
      setSubjects(allSubjects);
      if (allSubjects.length > 0) {
        setSelectedSubjects(allSubjects.map(s => s.name));
      }
      if (existingPlan) {
        setPlan(existingPlan);
        setAvailableHours(existingPlan.available_hours_per_day);
        setPreferredTime(existingPlan.preferred_time);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlannerData();
  }, [user]);

  const handleGeneratePlan = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const newPlan = await aiService.generateStudyPlan(
        user.id,
        availableHours,
        preferredTime,
        selectedSubjects.length > 0 ? selectedSubjects : subjects.map(s => s.name)
      );
      setPlan(newPlan);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleSession = async (sessionId: string) => {
    if (!plan) return;
    const updatedSessions = plan.sessions.map(s => 
      s.id === sessionId ? { ...s, is_completed: !s.is_completed } : s
    );
    const updatedPlan = { ...plan, sessions: updatedSessions };
    setPlan(updatedPlan);
    await academicService.saveStudyPlan(updatedPlan);
  };

  const handleRegenerateForMissed = async (sessionId: string) => {
    if (!plan) return;
    setGenerating(true);
    try {
      const updatedPlan = await aiService.regenerateStudyPlan(plan, sessionId);
      setPlan(updatedPlan);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <SkeletonLoader count={4} height="h-36" />;

  const completedCount = plan ? plan.sessions.filter(s => s.is_completed).length : 0;
  const totalCount = plan ? plan.sessions.length : 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/40">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest flex items-center gap-1.5 w-fit mb-2">
            <Sparkles className="w-3 h-3 text-amber-300" /> AI-Powered Personalized Schedule
          </span>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-indigo-400" /> AI Study Planner & Revision Manager
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Adapts dynamically to your exam dates, difficulty levels, and available daily study windows.
          </p>
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={generating}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all transform hover:scale-[1.02] disabled:opacity-50"
        >
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
          {plan ? 'Regenerate Study Plan' : 'Generate AI Study Plan'}
        </button>
      </div>

      {/* Configuration Controls Bar */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Available Hours Per Day</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="8"
              value={availableHours}
              onChange={(e) => setAvailableHours(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold font-mono shrink-0">
              {availableHours} Hrs/day
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Preferred Study Window</label>
          <select
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="Morning">Morning (8:00 AM - 12:00 PM)</option>
            <option value="Afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
            <option value="Evening">Evening (6:00 PM - 9:00 PM)</option>
            <option value="Night">Night (9:00 PM - 12:00 AM)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Subjects</label>
          <div className="text-xs text-indigo-300 font-semibold py-2">
            {subjects.length} Active Courses Included (DBMS, Networks, AI, OS, Software Eng)
          </div>
        </div>
      </div>

      {/* Progress & Sessions Grid */}
      {plan ? (
        <div className="space-y-6">
          {/* Progress Overview Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xl">
                {progressPct}%
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Weekly Revision Completion Rate</h3>
                <p className="text-xs text-slate-400 mt-0.5">{completedCount} of {totalCount} study sessions completed</p>
              </div>
            </div>

            <div className="w-full md:w-64 bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Weekly Goals list */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> AI Strategic Weekly Targets
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {plan.weekly_goals.map((goal, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{goal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sessions Timetable Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.sessions.map((session) => (
              <div
                key={session.id}
                className={`glass-card p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  session.is_completed 
                    ? 'border-emerald-500/40 bg-emerald-950/10 opacity-75' 
                    : 'border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                      {session.day_of_week}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      session.priority === 'High' 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {session.priority} Priority
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 mt-2">{session.subject_name}</h4>
                  <p className="text-xs text-indigo-300 font-medium mt-0.5">{session.topic}</p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> {session.time_slot}</span>
                    <span>({session.duration_minutes} mins)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleSession(session.id)}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      session.is_completed 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {session.is_completed ? 'Completed' : 'Mark Complete'}
                  </button>

                  {!session.is_completed && (
                    <button
                      onClick={() => handleRegenerateForMissed(session.id)}
                      title="Missed this session? Reschedule with AI"
                      className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 space-y-4">
          <BrainCircuit className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-slate-100">No Active Study Plan Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click the button above to generate a custom weekly study plan tailored to your available hours and upcoming exams.
          </p>
        </div>
      )}
    </div>
  );
};
