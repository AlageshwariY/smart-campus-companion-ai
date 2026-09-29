import React, { useState } from 'react';
import { LogIn, UserPlus, UserCheck, ShieldCheck, Mail, Lock, User, Hash, Building, Calendar, Phone, BookOpen, Database, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

type AuthMode = 'student-login' | 'student-register' | 'admin-login' | 'admin-register';

export const AuthModal: React.FC = () => {
  const { login, register, loginAsDemoStudent, loginAsDemoAdmin } = useAuth();
  const [mode, setMode] = useState<AuthMode>('student-login');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('4th Year');
  const [section, setSection] = useState('A');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [collegeName, setCollegeName] = useState('Smart Campus University');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isLogin = mode === 'student-login' || mode === 'admin-login';
  const isAdmin = mode === 'admin-login' || mode === 'admin-register';
  const role: UserRole = isAdmin ? 'admin' : 'student';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          throw new Error('Please fill in both email and password.');
        }
        await login(email, password, role);
      } else {
        // Register Mode Validations
        if (!fullName || !email || !password) {
          throw new Error('Full Name, Email, and Password are required.');
        }
        if (role === 'student' && !registerNumber) {
          throw new Error('Register Number is required for Student Registration.');
        }

        await register({
          full_name: fullName,
          email,
          password,
          role,
          register_number: registerNumber,
          department,
          year,
          section,
          phone,
          dob,
          college_name: collegeName
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden my-auto">
      {/* Background Ambient Blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pulse-glow pointer-events-none" />

      <div className="glass-panel w-full max-w-xl p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 font-black text-2xl">
            SC
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">SMART CAMPUS COMPANION</h1>
          <p className="text-xs text-slate-400">AI-Based Student Assistance and Academic Management System</p>
        </div>

        {/* Quick Demo Test Buttons */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase text-center tracking-wider">Instant Demo Mode Test Login</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={loginAsDemoStudent}
              className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <UserCheck className="w-4 h-4" /> Demo Student
            </button>
            <button
              type="button"
              onClick={loginAsDemoAdmin}
              className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4" /> Demo Admin
            </button>
          </div>
        </div>

        {/* Mode Selector Navigation Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('student-login')}
            className={`py-2 rounded-xl transition-all ${mode === 'student-login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Student Login
          </button>
          <button
            type="button"
            onClick={() => setMode('student-register')}
            className={`py-2 rounded-xl transition-all ${mode === 'student-register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Student Register
          </button>
          <button
            type="button"
            onClick={() => setMode('admin-login')}
            className={`py-2 rounded-xl transition-all ${mode === 'admin-login' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Admin Login
          </button>
          <button
            type="button"
            onClick={() => setMode('admin-register')}
            className={`py-2 rounded-xl transition-all ${mode === 'admin-register' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Admin Register
          </button>
        </div>

        {/* Error Alert Display */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alageshwari Y"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {!isLogin && role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Register Number *</label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    placeholder="e.g. 21CS042"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 uppercase font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Section</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="A"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">College / Institution</label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="Smart Campus College"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${isAdmin ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'}`}
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Processing Authentication...' : isLogin ? `Sign In as ${isAdmin ? 'Admin' : 'Student'}` : `Register ${isAdmin ? 'Admin' : 'Student'} Account`}
          </button>
        </form>
      </div>
    </div>
  );
};
