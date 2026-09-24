import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, CheckCircle2, Clock, GraduationCap, Megaphone, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { academicService } from '../../services/academicService';
import { AttendanceRecord, Assignment, Exam, Announcement } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';

interface PersonalizedStudentInsightsProps {
  onNavigateTab: (tab: string) => void;
}

export const PersonalizedStudentInsights: React.FC<PersonalizedStudentInsightsProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        const [att, asg, ex, ann] = await Promise.all([
          academicService.getStudentAttendance(user.id),
          academicService.getAssignments(user.department, user.year),
          academicService.getExams(user.department, user.year),
          academicService.getAnnouncements(user.department, user.year)
        ]);
        setAttendance(att);
        setAssignments(asg);
        setExams(ex);
        setAnnouncements(ann);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) return <SkeletonLoader count={4} height="h-32" />;

  // Analytics derived strictly from database
  const totalPresent = attendance.reduce((acc, r) => acc + r.present_days, 0);
  const totalDays = attendance.reduce((acc, r) => acc + r.total_days, 0);
  const overallPct = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
  const lowAttendanceSubject = attendance.find(r => (r.total_days > 0 ? (r.present_days / r.total_days) : 1) < 0.75);

  const pendingAssignments = assignments.filter(a => new Date(a.due_date).getTime() > Date.now());
  const upcomingExams = exams.filter(e => new Date(e.exam_date).getTime() >= new Date().setHours(0,0,0,0));
  const urgentAnnouncements = announcements.filter(a => a.priority === 'Urgent');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">My Personalized Academic Insights</h2>
            <p className="text-xs text-slate-400 mt-1">Real-time analytical summary generated from your database records</p>
          </div>
        </div>
      </div>

      {/* Priority Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Attendance Insight Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-slate-400">Attendance Status</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${overallPct >= 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {overallPct}%
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-100">
              {overallPct >= 75 ? 'Attendance Requirement Satisfied' : 'Attendance Warning Alert'}
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {lowAttendanceSubject 
                ? `Your attendance in "${lowAttendanceSubject.subject_name}" is currently below the 75% threshold.` 
                : 'All your subjects maintain healthy attendance levels above 75%.'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Open Attendance Analytics <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Assignments Insight Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-slate-400">Coursework Deadlines</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400">
                {pendingAssignments.length} Pending
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-100">
              {pendingAssignments.length > 0 ? `${pendingAssignments.length} Pending Assignment(s)` : 'All Assignments Cleared'}
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {pendingAssignments.length > 0
                ? `Nearest deadline: "${pendingAssignments[0].title}" due on ${new Date(pendingAssignments[0].due_date).toLocaleDateString()}.`
                : 'No urgent coursework deadlines. Great work!'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('assignments')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            Manage Assignments <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Exams Insight Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-slate-400">Upcoming Exams</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-400">
                {upcomingExams.length} Scheduled
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-100">
              {upcomingExams.length > 0 ? `Next Exam: ${upcomingExams[0].title}` : 'No Upcoming Exams'}
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {upcomingExams.length > 0
                ? `Scheduled on ${upcomingExams[0].exam_date} in ${upcomingExams[0].room}.`
                : 'No exam schedules detected in the database.'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('exams')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            View Full Exam Schedule <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
