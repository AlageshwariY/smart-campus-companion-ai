import React from 'react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  BookOpen, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();

  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
    { id: 'ai', label: 'AI Helper', icon: Sparkles, highlight: true },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: role === 'admin' ? 'admin' : 'assignments', label: role === 'admin' ? 'Admin' : 'Tasks', icon: role === 'admin' ? ShieldCheck : FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 border-t border-slate-800 flex items-center justify-around md:hidden z-40 backdrop-blur-lg px-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-full py-1 transition-all ${
              isActive ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl ${item.highlight ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
