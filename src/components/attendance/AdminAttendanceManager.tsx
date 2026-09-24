import React, { useState, useEffect } from 'react';
import { UserCheck, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { academicService } from '../../services/academicService';
import { Profile, Subject, AttendanceRecord } from '../../types';

export const AdminAttendanceManager: React.FC = () => {
  const [students, setStudents] = useState<Profile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [presentDays, setPresentDays] = useState<number>(25);
  const [totalDays, setTotalDays] = useState<number>(30);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const allProfiles = await academicService.getAllProfiles();
      const studentProfiles = allProfiles.filter(p => p.role === 'student');
      const allSubjects = await academicService.getSubjects();

      setStudents(studentProfiles);
      setSubjects(allSubjects);

      if (studentProfiles.length > 0) setSelectedStudentId(studentProfiles[0].id);
      if (allSubjects.length > 0) setSelectedSubjectId(allSubjects[0].id);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadExistingAttendance() {
      if (!selectedStudentId || !selectedSubjectId) return;
      const records = await academicService.getStudentAttendance(selectedStudentId);
      const match = records.find(r => r.subject_id === selectedSubjectId);
      if (match) {
        setPresentDays(match.present_days);
        setTotalDays(match.total_days);
      }
    }
    loadExistingAttendance();
  }, [selectedStudentId, selectedSubjectId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedSubjectId) {
      setMessage({ text: 'Please select a student and a subject.', type: 'error' });
      return;
    }

    if (presentDays > totalDays) {
      setMessage({ text: 'Present days cannot exceed total working days.', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await academicService.updateAttendance(selectedStudentId, selectedSubjectId, presentDays, totalDays);
      setMessage({ 
        text: 'Attendance successfully updated! Real-time notification sent to student UI.', 
        type: 'success' 
      });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update attendance.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 max-w-2xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Admin Attendance Entry Portal</h3>
          <p className="text-xs text-slate-400">Updates sync in real-time to student dashboard without refresh</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs mb-4 flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Student Select */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Select Student</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.register_number || s.email}) - {s.department}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Select */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Select Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name} ({sub.department})
              </option>
            ))}
          </select>
        </div>

        {/* Present and Total Days */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Present Days</label>
            <input
              type="number"
              min="0"
              value={presentDays}
              onChange={(e) => setPresentDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Total Working Days</label>
            <input
              type="number"
              min="1"
              value={totalDays}
              onChange={(e) => setTotalDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Dynamic Percentage Preview */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">Calculated Percentage:</span>
          <span className={`text-base font-extrabold ${Math.round((presentDays / (totalDays || 1)) * 100) >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {Math.round((presentDays / (totalDays || 1)) * 100)}%
          </span>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing to Database...' : 'Save & Sync Realtime'}
        </button>
      </form>
    </div>
  );
};
