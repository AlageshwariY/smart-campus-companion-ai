import React from 'react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Megaphone, 
  CalendarDays, 
  BarChart3, 
  ShieldCheck, 
  LogOut,
  BrainCircuit,
  FileCheck,
  Briefcase,
  Building2,
  Library
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, role, logout, loginAsDemoStudent, loginAsDemoAdmin } = useAuth();

  const studentNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance Analytics', icon: CheckCircle2 },
    { id: 'academic', label: 'Academic & Courses', icon: BookOpen },
    { id: 'planner', label: 'AI Study Planner', icon: BrainCircuit, badge: 'AI' },
    { id: 'notes', label: 'AI Notes Analyzer', icon: FileCheck, badge: 'AI' },
    { id: 'career', label: 'Career & Placement', icon: Briefcase, badge: 'AI' },
    { id: 'ai', label: 'Campus AI Assistant', icon: Sparkles, badge: 'AI' },
    { id: 'knowledge', label: 'Campus Knowledge (RAG)', icon: Library },
    { id: 'services', label: 'Campus Services', icon: Building2 },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'exams', label: 'Exam Center', icon: GraduationCap },
    { id: 'materials', label: 'Study Hub', icon: BookOpen },
    { id: 'events', label: 'Campus Events', icon: CalendarDays },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'insights', label: 'My Analytics', icon: BarChart3 }
  ];

  const adminNav: NavItem[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'admin', label: 'Admin Management', icon: ShieldCheck, highlight: true },
    { id: 'knowledge', label: 'Manage RAG Documents', icon: Library },
    { id: 'academic', label: 'Academic Settings', icon: BookOpen },
    { id: 'attendance', label: 'Attendance Entry', icon: CheckCircle2 },
    { id: 'timetable', label: 'Timetable Schedule', icon: Calendar },
    { id: 'assignments', label: 'Assignments Manager', icon: FileText },
    { id: 'exams', label: 'Exam Center', icon: GraduationCap },
    { id: 'materials', label: 'Study Materials', icon: BookOpen },
    { id: 'events', label: 'Manage Events', icon: CalendarDays },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'services', label: 'Campus Services', icon: Building2 },
    { id: 'ai', label: 'AI Campus Guide', icon: Sparkles }
  ];

  const navItems = role === 'admin' ? adminNav : studentNav;

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between hidden md:flex sticky top-0 h-screen z-30 backdrop-blur-md">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 font-bold text-lg">
            SC
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm leading-tight tracking-wide">SMART CAMPUS</h1>
            <p className="text-[11px] text-indigo-400 font-medium tracking-wider uppercase">COMPANION AI</p>
          </div>
        </div>

        {/* Role Quick Switcher Pill */}
        <div className="px-4 py-3 mx-4 my-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>ACTIVE ROLE:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}`}>
              {role || 'STUDENT'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={loginAsDemoStudent}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${role === 'student' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Student View
            </button>
            <button
              onClick={loginAsDemoAdmin}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${role === 'admin' ? 'bg-amber-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Admin View
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold' 
                    : item.highlight 
                      ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 border border-amber-500/20'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-400/20 text-indigo-300 rounded border border-indigo-400/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'} 
              alt={user?.full_name} 
              className="w-9 h-9 rounded-full object-cover border border-slate-700"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            title="Sign Out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
