import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { academicService } from '../../services/academicService';
import { CampusEvent, EventCategory } from '../../types';

export const AdminEventManager: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Workshop');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [venue, setVenue] = useState('Auditorium Hall A');
  const [organizer, setOrganizer] = useState('Tech Council');
  const [registrationLink, setRegistrationLink] = useState('https://campus.edu/register');
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    const data = await academicService.getEvents();
    setEvents(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await academicService.createEvent({
      title,
      category,
      description,
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      venue,
      organizer,
      registration_link: registrationLink
    });

    setMessage('Campus event created! Realtime update sent.');
    setTimeout(() => setMessage(null), 3000);
    setTitle('');
    setDescription('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    await academicService.deleteEvent(id);
    loadData();
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-pink-400" /> Create Campus Event / Activity
        </h3>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI & Robotics National Symposium"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                {['Workshop', 'Seminar', 'Hackathon', 'Cultural', 'Sports', 'Club', 'Placement'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Event Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Organizer</label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Publish Campus Event
          </button>
        </form>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase">Existing Campus Events ({events.length})</h4>
        </div>
        <div className="divide-y divide-slate-800">
          {events.map((e) => (
            <div key={e.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
              <div>
                <span className="text-[10px] font-bold text-pink-400 uppercase">[{e.category}] {e.venue}</span>
                <h5 className="text-sm font-bold text-slate-100">{e.title}</h5>
                <p className="text-xs text-slate-400 mt-1">Date: {e.event_date}</p>
              </div>
              <button
                onClick={() => handleDelete(e.id)}
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
