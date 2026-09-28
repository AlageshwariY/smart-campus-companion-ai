import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Calculator, AlertTriangle, Sliders, Award, User, Layers } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { academicService } from '../../services/academicService';
import { Subject, AttendanceRecord, InstitutionSettings } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const AcademicManagementView: React.FC = () => {
  const { user, role } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<InstitutionSettings>({
    min_attendance_pct: 75,
    institution_name: 'Smart Campus AI Institute of Technology',
    academic_year: '2025-2026'
  });
  const [loading, setLoading] = useState(true);

  // Calculator state
  const [selectedSubjId, setSelectedSubjId] = useState<string>('');
  const [missCount, setMissCount] = useState<number>(2);

  // Threshold edit state
  const [customThreshold, setCustomThreshold] = useState<number>(75);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [subjs, atts, stgs] = await Promise.all([
        academicService.getSubjects(),
        academicService.getStudentAttendance(user.id),
        academicService.getSettings()
      ]);
      setSubjects(subjs);
      setAttendance(atts);
      setSettings(stgs);
      setCustomThreshold(stgs.min_attendance_pct);
      if (atts.length > 0) setSelectedSubjId(atts[0].subject_id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSaveThreshold = async (newVal: number) => {
    setCustomThreshold(newVal);
    const updated = await academicService.updateSettings({ min_attendance_pct: newVal });
    setSettings(updated);
  };

  if (loading) return <SkeletonLoader count={4} height="h-36" />;

  const totalPresent = attendance.reduce((acc, r) => acc + r.present_days, 0);
  const totalDays = attendance.reduce((acc, r) => acc + r.total_days, 0);
  const overallPct = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

  // Selected subject calculator math
  const selectedRecord = attendance.find(a => a.subject_id === selectedSubjId);
  let calcFuturePct = 0;
  let currentSubjPct = 0;
  if (selectedRecord) {
    currentSubjPct = Math.round((selectedRecord.present_days / (selectedRecord.total_days || 1)) * 100);
    const futureTotal = selectedRecord.total_days + missCount;
    calcFuturePct = Math.round((selectedRecord.present_days / futureTotal) * 100);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-400" /> Academic Management & Course Analytics
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Subject credits, faculty, attendance trends, internal assessment tracking, and institutional requirements.
          </p>
        </div>

        {/* Configurable Threshold Controller Pill */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs">
          <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Configured Attendance Threshold</p>
            <div className="flex items-center gap-2 mt-0.5">
              <input
                type="range"
                min="50"
                max="90"
                step="5"
                value={customThreshold}
                onChange={(e) => handleSaveThreshold(parseInt(e.target.value))}
                className="w-24 accent-amber-400"
              />
              <span className="font-extrabold text-amber-400 font-mono text-sm">{customThreshold}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Attendance */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Overall Attendance</span>
            <CheckCircle2 className={`w-5 h-5 ${overallPct >= settings.min_attendance_pct ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <h3 className={`text-3xl font-extrabold mt-2 ${overallPct >= settings.min_attendance_pct ? 'text-emerald-400' : 'text-rose-400'}`}>
            {overallPct}%
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            {totalPresent} / {totalDays} total sessions attended across all courses
          </p>
          {overallPct < settings.min_attendance_pct && (
            <div className="mt-3 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Below configured minimum ({settings.min_attendance_pct}% threshold)
            </div>
          )}
        </div>

        {/* Total Course Credits */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Enrolled Semester Credits</span>
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-3xl font-extrabold text-indigo-400 mt-2">
            {subjects.reduce((acc, s) => acc + s.credits, 0)} Credits
          </h3>
          <p className="text-xs text-slate-400 mt-2">{subjects.length} active registered subjects in 4th Year CSE</p>
        </div>

        {/* Attendance Calculator Widget */}
        <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-400" /> Attendance Impact Calculator
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block">Select Course</label>
              <select
                value={selectedSubjId}
                onChange={(e) => setSelectedSubjId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200"
              >
                {attendance.map(a => (
                  <option key={a.subject_id} value={a.subject_id}>{a.subject_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block">Classes to Miss</label>
              <input
                type="number"
                min="1"
                max="10"
                value={missCount}
                onChange={(e) => setMissCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 font-mono"
              />
            </div>
          </div>

          {selectedRecord && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">If you miss next {missCount} classes:</span>
              <span className={`font-extrabold ${calcFuturePct < settings.min_attendance_pct ? 'text-rose-400' : 'text-emerald-400'}`}>
                {currentSubjPct}% &rarr; {calcFuturePct}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Subjects Detailed Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" /> Registered Subjects & Academic Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subj) => {
            const att = attendance.find(a => a.subject_id === subj.id);
            const pct = att ? Math.round((att.present_days / (att.total_days || 1)) * 100) : 0;
            const isWarning = pct < settings.min_attendance_pct;

            return (
              <div
                key={subj.id}
                className={`glass-card p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isWarning ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-indigo-400">{subj.code}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {subj.credits} Credits
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100">{subj.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" /> {subj.faculty_name || 'Department Faculty'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Attendance</span>
                    <span className={`font-bold ${isWarning ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {pct}% ({att ? `${att.present_days}/${att.total_days}` : '0/0'})
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${isWarning ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {isWarning && (
                    <p className="text-[10px] text-rose-300 font-semibold pt-1">
                      ⚠️ Attendance is approaching configured minimum requirement ({settings.min_attendance_pct}%).
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
