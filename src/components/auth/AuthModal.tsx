import React, { useState } from 'react';
import { LogIn, UserCheck, ShieldCheck, Mail, Lock, Sparkles, Database } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { login, loginAsDemoStudent, loginAsDemoAdmin, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await login(email, selectedRole);
      if (isConfigured) {
        setSentOtp(true);
      }
    } catch (err: any) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pulse-glow pointer-events-none" />

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 font-black text-2xl">
            SC
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">SMART CAMPUS COMPANION</h1>
          <p className="text-xs text-slate-400">AI-Powered Real-Time Student Assistance Platform</p>
        </div>

        {/* Database Mode Badge */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Database className={`w-4 h-4 ${isConfigured ? 'text-emerald-400' : 'text-indigo-400'}`} />
          <span>{isConfigured ? 'Connected to Supabase PostgreSQL' : 'Local Database Fallback Engine Active'}</span>
        </div>

        {/* Fast Demo One-Click Login Buttons */}
        <div className="space-y-2 pt-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase text-center tracking-wider">Instant One-Click Test Login</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={loginAsDemoStudent}
              className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              <UserCheck className="w-4 h-4" /> Demo Student
            </button>

            <button
              onClick={loginAsDemoAdmin}
              className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              <ShieldCheck className="w-4 h-4" /> Demo Admin
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase">Or Sign In with Email</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Campus Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${selectedRole === 'student' ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${selectedRole === 'admin' ? 'bg-amber-600/20 text-amber-300 border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
              >
                Admin
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In to Campus Portal'}
          </button>
        </form>

        {sentOtp && (
          <p className="text-xs text-emerald-400 text-center font-medium">
            Magic login link sent to your email address!
          </p>
        )}
      </div>
    </div>
  );
};
