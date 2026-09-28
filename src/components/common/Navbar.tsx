import React, { useState, useEffect } from 'react';
import { Bell, Search, Sparkles, Database, Check, RefreshCw, Command } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import { academicService } from '../../services/academicService';
import { NotificationItem } from '../../types';

interface NavbarProps {
  onOpenAI: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAI, onNavigateTab, onOpenCommandPalette }) => {
  const { user, role, isConfigured } = useAuth();
  const { subscribeToTable } = useRealtime();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    const items = await academicService.getNotifications(user.id);
    setNotifications(items);
  };

  useEffect(() => {
    loadNotifications();
    const unsub = subscribeToTable('notifications', () => {
      loadNotifications();
    });
    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    await academicService.markAllNotificationsRead(user?.id);
    loadNotifications();
  };

  return (
    <header className="h-16 bg-slate-900/80 border-b border-slate-800 sticky top-0 z-20 backdrop-blur-md px-4 md:px-8 flex items-center justify-between">
      {/* Search Bar / Command Palette Trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onOpenCommandPalette}
          className="relative w-full bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-400 text-left transition-all flex items-center justify-between group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
          <span className="truncate">Search commands, subjects, AI tools...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-400">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Supabase Status Indicator Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-950 border border-slate-800 text-slate-400" title={isConfigured ? 'Connected to live Supabase PostgreSQL Database' : 'Running on Local Database Store'}>
          <Database className={`w-3.5 h-3.5 ${isConfigured ? 'text-emerald-400' : 'text-indigo-400'}`} />
          <span className="hidden sm:inline">{isConfigured ? 'Supabase DB' : 'Local DB Engine'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* AI Assistant Quick Trigger Pill */}
        <button
          onClick={onOpenAI}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all transform hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="hidden sm:inline">Ask AI Assistant</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 hover:bg-slate-800 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl border border-slate-700/80 p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-100">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={async () => {
                        await academicService.markNotificationRead(n.id);
                        loadNotifications();
                        if (n.type === 'assignment') onNavigateTab('assignments');
                        else if (n.type === 'exam') onNavigateTab('exams');
                        else if (n.type === 'announcement') onNavigateTab('announcements');
                        else if (n.type === 'attendance') onNavigateTab('academic');
                        setShowNotifications(false);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        n.is_read 
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-70' 
                          : 'bg-indigo-950/30 border-indigo-500/30 font-medium hover:border-indigo-500/60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-slate-200">{n.title}</span>
                        <span className="text-[10px] text-slate-500">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Capsule */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
            alt={user?.full_name}
            className="w-8 h-8 rounded-full object-cover border border-indigo-500/40"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">{user?.full_name?.split(' ')[0]}</p>
            <p className="text-[10px] text-indigo-400 capitalize font-medium">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
