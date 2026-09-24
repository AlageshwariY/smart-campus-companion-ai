import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { academicService } from '../../services/academicService';
import { Announcement, AnnouncementPriority } from '../../types';

export const AdminAnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('Normal');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    const data = await academicService.getAnnouncements();
    setAnnouncements(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await academicService.createAnnouncement({
      title,
      description,
      priority,
      department,
      year
    });

    setMessage('Announcement published! Realtime notification broadcasted to all students.');
    setTimeout(() => setMessage(null), 3000);
    setTitle('');
    setDescription('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    await academicService.deleteAnnouncement(id);
    loadData();
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-amber-400" /> Broadcast Campus Announcement
        </h3>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Announcement Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Schedule for Mid-Term Project Viva"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Notice Content</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed announcement description..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Department Scope</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Year Scope</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="All">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" /> Broadcast Notice
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase">Active Announcements ({announcements.length})</h4>
        </div>
        <div className="divide-y divide-slate-800">
          {announcements.map((a) => (
            <div key={a.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase">[{a.priority}] Scope: {a.department}</span>
                <h5 className="text-sm font-bold text-slate-100">{a.title}</h5>
                <p className="text-xs text-slate-400 mt-1">{a.description.substring(0, 80)}...</p>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
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
