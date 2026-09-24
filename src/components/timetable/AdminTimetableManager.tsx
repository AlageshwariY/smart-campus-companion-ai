import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { academicService } from '../../services/academicService';
import { Subject, TimetableSlot } from '../../types';

export const AdminTimetableManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<TimetableSlot['day_of_week']>('Monday');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:00 AM');
  const [subjectId, setSubjectId] = useState('');
  const [room, setRoom] = useState('Lab 101');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('4th Year');
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    const subs = await academicService.getSubjects();
    setSubjects(subs);
    if (subs.length > 0) setSubjectId(subs[0].id);

    const tt = await academicService.getTimetable();
    setTimetable(tt);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const selSubject = subjects.find(s => s.id === subjectId);
    if (!selSubject) return;

    await academicService.addTimetableSlot({
      department,
      year,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      subject_id: subjectId,
      subject_name: selSubject.name,
      faculty_name: selSubject.faculty_name,
      room
    });

    setMessage('Timetable slot added! Syncing realtime to student UI.');
    setTimeout(() => setMessage(null), 3000);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await academicService.deleteTimetableSlot(id);
    loadData();
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Create Form */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-indigo-400" /> Add Timetable Lecture Slot
        </h3>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Day of Week</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Room / Venue</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Start Time</label>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="e.g. 09:00 AM"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">End Time</label>
            <input
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="e.g. 10:00 AM"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> Save Slot
            </button>
          </div>
        </form>
      </div>

      {/* Existing Slots Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase">Existing Timetable Registry ({timetable.length})</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {timetable.map((slot) => (
                <tr key={slot.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-semibold text-indigo-400">{slot.day_of_week}</td>
                  <td className="px-4 py-3 font-mono">{slot.start_time} - {slot.end_time}</td>
                  <td className="px-4 py-3 font-bold text-slate-100">{slot.subject_name}</td>
                  <td className="px-4 py-3 text-emerald-400">{slot.room}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
