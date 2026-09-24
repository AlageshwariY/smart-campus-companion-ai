import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { academicService } from '../../services/academicService';
import { Subject, Exam, ExamCategory } from '../../types';

export const AdminExamManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExamCategory>('Internal');
  const [subjectId, setSubjectId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('01:00 PM');
  const [room, setRoom] = useState('Exam Hall 101');
  const [maxMarks, setMaxMarks] = useState(50);
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('4th Year');
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    const subs = await academicService.getSubjects();
    setSubjects(subs);
    if (subs.length > 0) setSubjectId(subs[0].id);

    const data = await academicService.getExams();
    setExams(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const selSub = subjects.find(s => s.id === subjectId);
    if (!selSub) return;

    await academicService.createExam({
      title,
      category,
      subject_id: subjectId,
      subject_name: selSub.name,
      exam_date: examDate,
      start_time: startTime,
      end_time: endTime,
      room,
      department,
      year,
      max_marks: maxMarks
    });

    setMessage('Exam schedule created! Realtime update sent to students.');
    setTimeout(() => setMessage(null), 3000);
    setTitle('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    await academicService.deleteExam(id);
    loadData();
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-purple-400" /> Schedule Examination
        </h3>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Exam Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mid-Semester Assessment 1"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExamCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="Internal">Internal</option>
                <option value="Model">Model</option>
                <option value="Semester">Semester</option>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
              />
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
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Save Exam Schedule
          </button>
        </form>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase">Scheduled Exams ({exams.length})</h4>
        </div>
        <div className="divide-y divide-slate-800">
          {exams.map((e) => (
            <div key={e.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase">[{e.category}] {e.subject_name}</span>
                <h5 className="text-sm font-bold text-slate-100">{e.title}</h5>
                <p className="text-xs text-slate-400 mt-1">Date: {e.exam_date} | Room: {e.room}</p>
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
