import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import { academicService } from '../../services/academicService';
import { AttendanceRecord } from '../../types';
import { AttendanceInsightCalculator } from '../dashboard/AttendanceInsightCalculator';
import { EmptyState } from '../common/EmptyState';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const AttendanceView: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToTable } = useRealtime();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAttendance = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const records = await academicService.getStudentAttendance(user.id);
      setAttendance(records);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
    const unsubscribe = subscribeToTable('attendance', () => {
      console.log('Attendance Realtime payload received, reloading student attendance...');
      loadAttendance();
    });
    return () => unsubscribe();
  }, [user]);

  if (loading) return <SkeletonLoader count={4} height="h-32" />;

  if (!attendance || attendance.length === 0) {
    return (
      <EmptyState
        title="No Attendance Data"
        message="No attendance data available yet. Attendance entries will appear here once published by faculty/admin."
        icon={<CheckCircle2 className="w-12 h-12 text-slate-500" />}
      />
    );
  }

  // Dynamic calculations from database
  const totalPresentDays = attendance.reduce((sum, item) => sum + item.present_days, 0);
  const totalWorkingDays = attendance.reduce((sum, item) => sum + item.total_days, 0);
  const totalAbsentDays = totalWorkingDays - totalPresentDays;
  const overallPercentage = totalWorkingDays > 0 ? Math.round((totalPresentDays / totalWorkingDays) * 100) : 0;

  // Chart data
  const chartData = attendance.map(r => ({
    name: r.subject_code || r.subject_name?.substring(0, 10) || 'Subj',
    percentage: r.total_days > 0 ? Math.round((r.present_days / r.total_days) * 100) : 0,
    present: r.present_days,
    total: r.total_days
  }));

  const pieData = [
    { name: 'Present Days', value: totalPresentDays, color: '#10b981' },
    { name: 'Absent Days', value: totalAbsentDays, color: '#f43f5e' }
  ];

  const lowAttendanceSubjects = attendance.filter(r => (r.total_days > 0 ? (r.present_days / r.total_days) : 1) < 0.75);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Smart Attendance Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time attendance calculations powered by Supabase PostgreSQL</p>
        </div>
        <button
          onClick={loadAttendance}
          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 self-start sm:self-center transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Percentage */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Overall Attendance</p>
              <h3 className={`text-3xl font-extrabold mt-1 ${overallPercentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {overallPercentage}%
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl ${overallPercentage >= 75 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-medium">
            {overallPercentage >= 75 ? 'Above 75% requirement ✅' : 'Below 75% threshold ⚠️'}
          </p>
        </div>

        {/* Present Days */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Present Days</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{totalPresentDays}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-medium">Out of {totalWorkingDays} total classes</p>
        </div>

        {/* Absent Days */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Absent Days</p>
              <h3 className="text-3xl font-extrabold text-rose-400 mt-1">{totalAbsentDays}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-medium">Total leaves recorded</p>
        </div>

        {/* Total Working Days */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Working Days</p>
              <h3 className="text-3xl font-extrabold text-indigo-400 mt-1">{totalWorkingDays}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-medium">Across {attendance.length} subjects</p>
        </div>
      </div>

      {/* Warnings & Insights Alert Banner if attendance < 75% */}
      {lowAttendanceSubjects.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-300">Attendance Warning Notice</h4>
            <p className="text-rose-200/80 mt-0.5">
              You have {lowAttendanceSubjects.length} subject(s) with attendance under 75%: {' '}
              <span className="font-semibold text-rose-200">
                {lowAttendanceSubjects.map(s => s.subject_name).join(', ')}
              </span>. Please speak to your mentor or attend upcoming lectures to avoid exam shortage.
            </p>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Bar Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 mb-4">Subject-Wise Attendance Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                  formatter={(val: any) => [`${val}%`, 'Attendance']}
                />
                <Bar dataKey="percentage" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Ratio Pie Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-100 mb-2">Present vs Absent Ratio</h3>
          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-slate-100">{overallPercentage}%</span>
              <p className="text-[10px] text-slate-400">Total</p>
            </div>
          </div>
          <div className="flex justify-center gap-6 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Present ({totalPresentDays}d)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Absent ({totalAbsentDays}d)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Subject List Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <h3 className="text-sm font-bold text-slate-100">Subject Attendance Registry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Subject Name</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Present / Total</th>
                <th className="px-6 py-3">Percentage</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {attendance.map((row) => {
                const pct = row.total_days > 0 ? Math.round((row.present_days / row.total_days) * 100) : 0;
                const statusColor = pct >= 85 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : pct >= 75 
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30';

                return (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-100">{row.subject_name}</td>
                    <td className="px-6 py-4 text-slate-400">{row.subject_code}</td>
                    <td className="px-6 py-4 font-mono">{row.present_days} / {row.total_days} days</td>
                    <td className="px-6 py-4 font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColor}`}>
                        {pct >= 85 ? 'Excellent' : pct >= 75 ? 'Good' : 'Warning (<75%)'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Calculator */}
      <AttendanceInsightCalculator attendanceRecords={attendance} />
    </div>
  );
};
