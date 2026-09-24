import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  FileText, 
  GraduationCap, 
  Megaphone, 
  CalendarDays, 
  Sparkles, 
  Clock, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Bell,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import { academicService } from '../../services/academicService';
import { AttendanceRecord, TimetableSlot, Assignment, Exam, Announcement, CampusEvent, NotificationItem } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const { subscribeToTable } = useRealtime();

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [att, tt, asg, ex, ann, evt, notif] = await Promise.all([
        academicService.getStudentAttendance(user.id),
        academicService.getTimetable(user.department, user.year),
        academicService.getAssignments(user.department, user.year),
        academicService.getExams(user.department, user.year),
        academicService.getAnnouncements(user.department, user.year),
        academicService.getEvents(),
        academicService.getNotifications(user.id)
      ]);

      setAttendance(att);
      setTimetable(tt);
      setAssignments(asg);
      setExams(ex);
      setAnnouncements(ann);
      setEvents(evt);
      setNotifications(notif);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Subscribe to all tables for instant realtime sync
    const unsub1 = subscribeToTable('attendance', () => loadDashboardData());
    const unsub2 = subscribeToTable('timetable', () => loadDashboardData());
    const unsub3 = subscribeToTable('assignments', () => loadDashboardData());
    const unsub4 = subscribeToTable('exams', () => loadDashboardData());
    const unsub5 = subscribeToTable('announcements', () => loadDashboardData());
    const unsub6 = subscribeToTable('events', () => loadDashboardData());
    const unsub7 = subscribeToTable('notifications', () => loadDashboardData());

    return () => {
      unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); unsub7();
    };
  }, [user]);

  if (loading) return <SkeletonLoader count={4} height="h-36" />;

  // Calculations derived dynamically from real database state
  const totalPresent = attendance.reduce((acc, r) => acc + r.present_days, 0);
  const totalDays = attendance.reduce((acc, r) => acc + r.total_days, 0);
  const overallAttendancePct = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

  // Greeting based on current hour
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Today's classes filtering
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];
  const todaysClasses = timetable.filter(t => t.day_of_week === todayName);

  // Pending assignments count
  const pendingAssignments = assignments.filter(a => new Date(a.due_date).getTime() > Date.now());

  // Next upcoming exam
  const upcomingExams = exams.filter(e => new Date(e.exam_date).getTime() >= new Date().setHours(0,0,0,0));
  const nextExam = upcomingExams.length > 0 ? upcomingExams[0] : null;

  // Unread notifications count
  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Student Welcome Header Card */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Digital Campus Hub</span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 mt-1">
              {greeting}, {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs">
            <div>
              <p className="text-[10px] text-slate-400">Department</p>
              <p className="font-bold text-slate-200">{user?.department || 'CSE'}</p>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <p className="text-[10px] text-slate-400">Year & Section</p>
              <p className="font-bold text-slate-200">{user?.year || '4th Year'} ({user?.section || 'A'})</p>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <p className="text-[10px] text-slate-400">Reg Number</p>
              <p className="font-bold text-indigo-400 font-mono">{user?.register_number || '21CS042'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <div 
          onClick={() => onNavigateTab('attendance')}
          className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Overall Attendance</span>
            <div className={`p-2 rounded-xl ${overallAttendancePct >= 75 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className={`text-3xl font-extrabold mt-2 ${overallAttendancePct >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {overallAttendancePct}%
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
            <span>{totalPresent}/{totalDays} Days Attended</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
        </div>

        {/* Pending Assignments Card */}
        <div 
          onClick={() => onNavigateTab('assignments')}
          className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Pending Assignments</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-amber-400 mt-2">{pendingAssignments.length}</h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
            <span>{pendingAssignments.length > 0 ? `Next due in ${Math.ceil((new Date(pendingAssignments[0].due_date).getTime() - Date.now()) / 86400000)}d` : 'No pending tasks'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
        </div>

        {/* Next Exam Card */}
        <div 
          onClick={() => onNavigateTab('exams')}
          className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Next Exam Spotlight</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-2 truncate">
            {nextExam ? nextExam.title : 'No upcoming exams'}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
            <span className="text-purple-300 font-semibold">{nextExam ? nextExam.exam_date : 'All clear'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
        </div>

        {/* AI Assistant Callout Card */}
        <div 
          onClick={() => onNavigateTab('ai')}
          className="glass-card p-5 rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/60 to-purple-950/40 hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-indigo-300">AI Campus Assistant</span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-amber-300">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-2">"Ask me anything about your attendance or subjects!"</p>
          <div className="flex items-center justify-between text-[11px] text-indigo-300 mt-3 pt-2 border-t border-indigo-500/20 font-bold">
            <span>Launch AI Assistant</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Grid Section: Today's Classes & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Classes */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Today's Lecture Schedule ({todayName})
            </h3>
            <button
              onClick={() => onNavigateTab('timetable')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              Full Timetable &rarr;
            </button>
          </div>

          {todaysClasses.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No scheduled lectures for today ({todayName}). Enjoy your self-study time!</p>
          ) : (
            <div className="space-y-3">
              {todaysClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-indigo-500/30 transition-all"
                >
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 font-mono">{cls.start_time} - {cls.end_time}</span>
                    <h4 className="text-sm font-bold text-slate-100 mt-0.5">{cls.subject_name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cls.faculty_name || 'Faculty Member'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {cls.room}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Announcements Sidebar Widget */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400" /> Recent Announcements
              </h3>
              <button
                onClick={() => onNavigateTab('announcements')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                View All
              </button>
            </div>

            {announcements.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent campus announcements.</p>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${ann.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {ann.priority}
                      </span>
                      <span className="text-[10px] text-slate-500">{new Date(ann.created_at || '').toLocaleDateString()}</span>
                    </div>
                    <h5 className="font-bold text-slate-200 mt-1">{ann.title}</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{ann.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
