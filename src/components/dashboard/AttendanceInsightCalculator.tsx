import React, { useState } from 'react';
import { Calculator, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { AttendanceRecord } from '../../types';

interface AttendanceInsightCalculatorProps {
  attendanceRecords: AttendanceRecord[];
}

export const AttendanceInsightCalculator: React.FC<AttendanceInsightCalculatorProps> = ({ attendanceRecords }) => {
  const [targetPct, setTargetPct] = useState<number>(75);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('overall');
  const [additionalClasses, setAdditionalClasses] = useState<number>(5);

  if (!attendanceRecords || attendanceRecords.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-slate-400">
        <Calculator className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-xs">No attendance records available for calculator analysis.</p>
      </div>
    );
  }

  // Calculate stats based on selection
  let present = 0;
  let total = 0;
  let currentPct = 0;

  if (selectedSubjectId === 'overall') {
    present = attendanceRecords.reduce((acc, r) => acc + r.present_days, 0);
    total = attendanceRecords.reduce((acc, r) => acc + r.total_days, 0);
  } else {
    const selected = attendanceRecords.find(r => r.subject_id === selectedSubjectId);
    if (selected) {
      present = selected.present_days;
      total = selected.total_days;
    }
  }

  currentPct = total > 0 ? Math.round((present / total) * 100) : 0;

  // Formula: (present + N) / (total + N) * 100
  const futurePresent = present + Number(additionalClasses);
  const futureTotal = total + Number(additionalClasses);
  const futurePct = futureTotal > 0 ? Math.round((futurePresent / futureTotal) * 100) : 0;

  // Classes needed to reach target percentage:
  // (present + x) / (total + x) >= target / 100
  // 100*present + 100*x >= target*total + target*x
  // x*(100 - target) >= target*total - 100*present
  // x = ceil( (target*total - 100*present) / (100 - target) )
  let classesNeededForTarget = 0;
  if (currentPct < targetPct && targetPct < 100) {
    const numerator = (targetPct * total) - (100 * present);
    const denominator = 100 - targetPct;
    classesNeededForTarget = Math.max(0, Math.ceil(numerator / denominator));
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-gradient-to-br from-slate-900/90 via-indigo-950/20 to-slate-900/90">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Smart Attendance Insight Calculator</h3>
            <p className="text-[11px] text-slate-400">Dynamic target prediction powered by database data</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Target: {targetPct}%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Subject selector */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-medium">Select Subject Scope</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="overall">All Subjects (Overall)</option>
            {attendanceRecords.map((r) => (
              <option key={r.id} value={r.subject_id}>
                {r.subject_name || r.subject_code}
              </option>
            ))}
          </select>
        </div>

        {/* Target Slider */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-medium">Desired Target Percentage: {targetPct}%</label>
          <input
            type="range"
            min="60"
            max="95"
            step="1"
            value={targetPct}
            onChange={(e) => setTargetPct(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer mt-2"
          />
        </div>

        {/* Additional Classes Input */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-medium">If I Attend Next N Classes:</label>
          <input
            type="number"
            min="1"
            max="30"
            value={additionalClasses}
            onChange={(e) => setAdditionalClasses(Math.max(1, Number(e.target.value)))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Outcome Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <p className="text-[11px] text-slate-400 mb-1">Current Attendance</p>
          <p className="text-xl font-extrabold text-slate-100">{currentPct}%</p>
          <p className="text-[10px] text-slate-500 mt-1">{present} / {total} total days</p>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] text-slate-400">Projected Attendance</p>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-emerald-400">+{futurePct - currentPct}% &rarr; {futurePct}%</p>
          <p className="text-[10px] text-emerald-300/80 mt-1">If you attend next {additionalClasses} classes</p>
        </div>

        <div className={`p-4 rounded-xl border ${currentPct >= targetPct ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30'}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] text-slate-400">Required Classes</p>
            <Target className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className={`text-xl font-extrabold ${currentPct >= targetPct ? 'text-emerald-400' : 'text-amber-400'}`}>
            {currentPct >= targetPct ? 'Target Met! 🎉' : `${classesNeededForTarget} Classes`}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {currentPct >= targetPct ? `Above target ${targetPct}%` : `Needed continuously to reach ${targetPct}%`}
          </p>
        </div>
      </div>
    </div>
  );
};
