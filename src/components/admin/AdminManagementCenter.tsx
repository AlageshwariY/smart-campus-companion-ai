import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  GraduationCap, 
  BookOpen, 
  CalendarDays, 
  Megaphone 
} from 'lucide-react';
import { AdminAttendanceManager } from '../attendance/AdminAttendanceManager';
import { AdminTimetableManager } from '../timetable/AdminTimetableManager';
import { AdminAssignmentManager } from '../assignments/AdminAssignmentManager';
import { AdminExamManager } from '../exams/AdminExamManager';
import { AdminMaterialManager } from '../materials/AdminMaterialManager';
import { AdminEventManager } from '../events/AdminEventManager';
import { AdminAnnouncementManager } from '../announcements/AdminAnnouncementManager';

export const AdminManagementCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'timetable' | 'assignments' | 'exams' | 'materials' | 'events' | 'announcements'>('attendance');

  const tabs = [
    { id: 'attendance', label: 'Attendance Entry', icon: CheckCircle2 },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'exams', label: 'Exams', icon: GraduationCap },
    { id: 'materials', label: 'Study Materials', icon: BookOpen },
    { id: 'events', label: 'Campus Events', icon: CalendarDays },
    { id: 'announcements', label: 'Announcements', icon: Megaphone }
  ] as const;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-amber-950/40 to-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Centralized Admin Management Hub</h2>
            <p className="text-xs text-slate-400 mt-1">Manage database records and push live Supabase Realtime updates to students</p>
          </div>
        </div>
      </div>

      {/* Module Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive 
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' 
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Selected Admin Component */}
      <div className="pt-2">
        {activeTab === 'attendance' && <AdminAttendanceManager />}
        {activeTab === 'timetable' && <AdminTimetableManager />}
        {activeTab === 'assignments' && <AdminAssignmentManager />}
        {activeTab === 'exams' && <AdminExamManager />}
        {activeTab === 'materials' && <AdminMaterialManager />}
        {activeTab === 'events' && <AdminEventManager />}
        {activeTab === 'announcements' && <AdminAnnouncementManager />}
      </div>
    </div>
  );
};
