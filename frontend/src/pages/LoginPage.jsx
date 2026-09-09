import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, Key, User, AlertCircle, Database, Check } from 'lucide-react';

const BACKEND_DEMO_CREDENTIALS = {
  username: 'admin_shillong',
  password: 'Admin@1234',
  role: 'District Admin',
  access: 'Full Access',
};

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quickFillApplied, setQuickFillApplied] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const targetPath =
    location.state?.from?.pathname && location.state.from.pathname !== '/login'
      ? location.state.from.pathname
      : '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await login(username.trim(), password);
      console.log('LOGIN RESPONSE:', {
        role: response?.role,
        district: response?.district,
        hasToken: Boolean(response?.token),
      });
      navigate(targetPath, { replace: true });
    } catch (err) {
      // Clean error presentation for 401 or auth failures
      if (
        err.status === 401 ||
        (err.message && err.message.toLowerCase().includes('401')) ||
        (err.message && err.message.toLowerCase().includes('invalid')) ||
        (err.data?.detail && typeof err.data.detail === 'string' && err.data.detail.toLowerCase().includes('invalid'))
      ) {
        setError('Invalid username or password.');
      } else {
        setError(err.message || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUsername(BACKEND_DEMO_CREDENTIALS.username);
    setPassword(BACKEND_DEMO_CREDENTIALS.password);
    setError(null);
    setQuickFillApplied(true);
    setTimeout(() => setQuickFillApplied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F6] dark:bg-black flex items-center justify-center p-4 selection:bg-[#006B4F] selection:text-white transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-2xl p-7 sm:p-9 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex p-1 rounded-full bg-white border border-emerald-600/30 dark:border-emerald-700/50 shadow-sm overflow-hidden">
            <img src="/logo.png" alt="NER LEWS Logo" className="w-14 h-14 object-contain rounded-full" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Landslide Risk Monitoring Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              North Eastern Region • East Khasi Hills District
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/20">
            <Database className="w-3 h-3" />
            <span>Connected to GIS Database</span>
          </div>
        </div>

        {/* Clean error message without raw technical codes */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-[#E63946] flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label htmlFor="login-username" className="block font-semibold text-slate-700 dark:text-zinc-300">
              Username <span className="text-[#E63946]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="login-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin_shillong"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] font-medium transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block font-semibold text-slate-700 dark:text-zinc-300">
              Password <span className="text-[#E63946]">*</span>
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] font-medium transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-[#006B4F] hover:bg-[#00523C] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Operations Console'}</span>
          </button>
        </form>

        {/* Demo Credentials Quick Fill — Single District Admin option only */}
        <div className="pt-4 border-t border-[#D9E2DE] dark:border-[#1E1E24] space-y-2">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 text-center">
            Quick fill demo credentials
          </p>

          <button
            type="button"
            onClick={handleQuickFill}
            className="w-full cursor-pointer flex items-center justify-between p-3.5 rounded-xl bg-[#F5F7F6] dark:bg-[#141418] hover:bg-[#EAF5F0] dark:hover:bg-emerald-950/20 border border-[#D9E2DE] dark:border-[#27272A] hover:border-[#006B4F]/50 dark:hover:border-emerald-500/40 active:scale-[0.98] transition-all duration-200 group text-left shadow-2xs"
            title="Click to populate District Admin credentials"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#006B4F] dark:text-emerald-400 group-hover:underline">
                  {BACKEND_DEMO_CREDENTIALS.role}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#EAF5F0] dark:bg-emerald-950/50 text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/20">
                  {BACKEND_DEMO_CREDENTIALS.access}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                {BACKEND_DEMO_CREDENTIALS.username} • {BACKEND_DEMO_CREDENTIALS.password}
              </div>
            </div>

            <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#1E2024] border border-[#D9E2DE] dark:border-[#27272A] flex items-center justify-center shrink-0 group-hover:border-[#006B4F] transition-colors">
              {quickFillApplied ? (
                <Check className="w-4 h-4 text-[#006B4F] dark:text-emerald-400 animate-fade-in" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-[#006B4F] dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
