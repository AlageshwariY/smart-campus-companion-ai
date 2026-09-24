import React, { useState, useEffect } from 'react';
import { CalendarDays, MapPin, Clock, ExternalLink, Trophy, Users, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import { academicService } from '../../services/academicService';
import { CampusEvent, EventCategory } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const CampusEventsView: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToTable } = useRealtime();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'All'>('All');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await academicService.getEvents();
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    const unsub = subscribeToTable('events', () => loadEvents());
    return () => unsub();
  }, []);

  if (loading) return <SkeletonLoader count={3} height="h-32" />;

  const filteredEvents = events.filter(e => activeCategory === 'All' || e.category === activeCategory);

  const categories: (EventCategory | 'All')[] = [
    'All', 'Hackathon', 'Placement', 'Workshop', 'Seminar', 'Cultural', 'Sports', 'Club'
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-pink-400" />
            Events & Campus Activities
          </h2>
          <p className="text-xs text-slate-400 mt-1">Hackathons, placement drives, guest lectures, and cultural fests</p>
        </div>
        <button
          onClick={loadEvents}
          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 self-start sm:self-center transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Events
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const count = events.filter(e => cat === 'All' || e.category === cat).length;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive 
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' 
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No Upcoming Events"
          message={`No events scheduled under '${activeCategory}'.`}
          icon={<CalendarDays className="w-12 h-12 text-slate-500" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-pink-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    {evt.category}
                  </span>
                  <span className="text-[11px] font-bold text-amber-400 font-mono">
                    {evt.event_date}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 mt-2">{evt.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{evt.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> {evt.start_time} - {evt.end_time}
                  </p>
                  <p className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" /> Venue: {evt.venue}
                  </p>
                </div>

                {evt.registration_link && (
                  <a
                    href={evt.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-pink-600/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Register Now
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
