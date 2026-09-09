import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, Key, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // All hooks must be called unconditionally before any early return
  const [username, setUsername] = useState('official_shillong');
  const [password, setPassword] = useState('meghalaya2026');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, skip the login page and go straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If user was redirected from a protected route, send them back there after login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login(username, password);
      // Navigate to the originally intended route (or dashboard if none)
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-16">
      <div className="bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 rounded-xl p-7 sm:p-9 shadow-lg space-y-6">
        
        {/* Header with platform logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-1.5 rounded-2xl bg-black border border-[#D9E2DE] dark:border-zinc-700 shadow-md">
            <img src="/logo.svg" alt="NER LEWS Logo" className="w-14 h-14 object-cover rounded-xl" />
          </div>
          <h1 className="text-xl font-black text-[#006B4F] dark:text-emerald-400">
            {t('auth.login_title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t('auth.login_subtitle')}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#E63946] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold text-[#1F2937] dark:text-zinc-300 mb-1.5">
              {t('auth.username')} <span className="text-[#E63946]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. official_shillong"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800 text-[#1F2937] dark:text-white focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1F2937] dark:text-zinc-300 mb-1.5">
              {t('auth.password')} <span className="text-[#E63946]">*</span>
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800 text-[#1F2937] dark:text-white focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-[#006B4F] hover:bg-[#00523c] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? t('auth.authenticating') : t('auth.signin_button')}</span>
          </button>
        </form>

        {/* Quick Demo Pre-fill */}
        <div className="pt-4 border-t border-[#D9E2DE] dark:border-zinc-800/80 space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block text-center">
            {t('auth.demo_credentials')}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('official_shillong', 'meghalaya2026')}
              className="p-2 rounded-lg bg-[#F5F7F6] dark:bg-zinc-900 hover:bg-[#EAF5F0] dark:hover:bg-zinc-800 border border-[#D9E2DE] dark:border-zinc-800 text-left transition-colors"
            >
              <div className="font-bold text-[11px] text-[#006B4F] dark:text-emerald-400">
                {t('auth.demo_admin')}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">official_shillong</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('sdrf_lead_sohra', 'rescue2026')}
              className="p-2 rounded-lg bg-[#F5F7F6] dark:bg-zinc-900 hover:bg-[#EAF5F0] dark:hover:bg-zinc-800 border border-[#D9E2DE] dark:border-zinc-800 text-left transition-colors"
            >
              <div className="font-bold text-[11px] text-[#006B4F] dark:text-emerald-400">
                {t('auth.demo_sdrf')}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">sdrf_lead_sohra</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
