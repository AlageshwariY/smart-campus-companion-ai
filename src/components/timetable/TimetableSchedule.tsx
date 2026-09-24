import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import { academicService } from '../../services/academicService';
import { TimetableSlot } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const TimetableSchedule: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToTable } = useRealtime();
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<string>('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const loadTimetable = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await academicService.getTimetable(user.department, user.year);
      setTimetable(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set default day based on today's day of week
    const currentDayName = daysOfWeek[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    setSelectedDay(currentDayName);

    loadTimetable();
    const unsub = subscribeToTable('timetable', () => {
      loadTimetable();
    });
    return () => unsub();
  }, [user]);

  if (loading) return <SkeletonLoader count={4} height="h-28" />;

  // Filter for selected day
  const daySlots = timetable.filter(t => t.day_of_week === selectedDay);

  // Determine current/next upcoming class for spotlight
  const todayName = daysOfWeek[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todaySlots = timetable.filter(t => t.day_of_week === todayName);
  const spotlightClass = todaySlots.length > 0 ? todaySlots[0] : (timetable.length > 0 ? timetable[0] : null);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            Smart Academic Timetable
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Department: {user?.department || 'Computer Science'} | Year: {user?.year || '4th Year'}
          </p>
        </div>
        <button
          onClick={loadTimetable}
          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 self-start sm:self-center transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Schedule
        </button>
      </div>

      {/* NEXT / CURRENT CLASS SPOTLIGHT CARD */}
      {spotlightClass && (
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60 relative overflow-hidden">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Spotlight &bull; Next Scheduled Session</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-100">{spotlightClass.subject_name}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1 font-semibold text-indigo-300">
                  <Clock className="w-3.5 h-3.5" /> {spotlightClass.start_time} &ndash; {spotlightClass.end_time}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <User className="w-3.5 h-3.5" /> {spotlightClass.faculty_name || 'Faculty Mentor'}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <MapPin className="w-3.5 h-3.5" /> Room: {spotlightClass.room}
                </span>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold self-start md:self-center shadow-lg shadow-indigo-600/30">
              {spotlightClass.day_of_week}
            </span>
          </div>
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {daysOfWeek.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = todayName === day;
          const count = timetable.filter(t => t.day_of_week === day).length;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Timetable List for Selected Day */}
      {daySlots.length === 0 ? (
        <EmptyState
          title={`No Classes Scheduled for ${selectedDay}`}
          message="No active timetable entries found for this day in the database."
          icon={<Calendar className="w-12 h-12 text-slate-500" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daySlots.map((slot) => (
            <div
              key={slot.id}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {slot.start_time} - {slot.end_time}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" /> {slot.room}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-100 mt-2">{slot.subject_name}</h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" /> {slot.faculty_name || 'Faculty Member'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
