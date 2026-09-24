import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  CheckCircle2, 
  GraduationCap, 
  FileText, 
  Megaphone, 
  CalendarDays, 
  ShieldCheck, 
  Plus, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import { academicService } from '../../services/academicService';
import { Profile, Department, Assignment, Exam, Announcement, CampusEvent } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const { subscribeToTable } = useRealtime();

  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAdminMetrics = async () => {
    setLoading(true);
    try {
      const [profiles, depts, asgs, exms, anns, evts] = await Promise.all([
        academicService.getAllProfiles(),
        academicService.getDepartments(),
        academicService.getAssignments(),
        academicService.getExams(),
        academicService.getAnnouncements(),
        academicService.getEvents()
      ]);

      const st = profiles.filter(p => p.role === 'student');
      setStudentsCount(st.length);
      setDepartments(depts);
      setAssignments(asgs);
      setExams(exms);
      setAnnouncements(anns);
      setEvents(evts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminMetrics();
    const unsub = subscribeToTable('profiles', () => loadAdminMetrics());
    return () => unsub();
  }, []);

  if (loading) return <SkeletonLoader count={4} height="h-32" />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Admin Welcome Header */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ADMINISTRATION PORTAL
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 mt-2">
              Welcome, {user?.full_name} 👑
            </h1>
            <p className="text-xs text-slate-400 mt-1">Real-time database metrics & administrative control center</p>
          </div>

          <button
            onClick={() => onNavigateTab('admin')}
            className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2 self-start md:self-center"
          >
            <ShieldCheck className="w-4 h-4" /> Open Management Center
          </button>
        </div>
      </div>

      {/* Real Statistics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Registered Students</p>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{studentsCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Calculated from profiles table</p>
        </div>

        {/* Total Departments */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Departments</p>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{departments.length}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">CSE, ECE, IT departments</p>
        </div>

        {/* Active Assignments */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Published Assignments</p>
              <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{assignments.length}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Coursework active in system</p>
        </div>

        {/* Scheduled Exams */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Scheduled Exams</p>
              <h3 className="text-3xl font-extrabold text-purple-400 mt-1">{exams.length}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Internal & Semester exams</p>
        </div>
      </div>

      {/* Quick Administrative Shortcuts */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 mb-4">Quick Administrative Action Shortcuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('admin')}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 text-left text-xs space-y-2 transition-all hover:bg-slate-900"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="font-bold text-slate-200">Update Attendance</p>
            <p className="text-[10px] text-slate-400">Mark student present/absent</p>
          </button>

          <button
            onClick={() => onNavigateTab('admin')}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 text-left text-xs space-y-2 transition-all hover:bg-slate-900"
          >
            <FileText className="w-5 h-5 text-indigo-400" />
            <p className="font-bold text-slate-200">Post Assignment</p>
            <p className="text-[10px] text-slate-400">Assign coursework & due date</p>
          </button>

          <button
            onClick={() => onNavigateTab('admin')}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 text-left text-xs space-y-2 transition-all hover:bg-slate-900"
          >
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <p className="font-bold text-slate-200">Schedule Exam</p>
            <p className="text-[10px] text-slate-400">Publish exam dates & rooms</p>
          </button>

          <button
            onClick={() => onNavigateTab('admin')}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 text-left text-xs space-y-2 transition-all hover:bg-slate-900"
          >
            <Megaphone className="w-5 h-5 text-amber-400" />
            <p className="font-bold text-slate-200">Broadcast Notice</p>
            <p className="text-[10px] text-slate-400">Send urgent announcement</p>
          </button>
        </div>
      </div>
    </div>
  );
};
