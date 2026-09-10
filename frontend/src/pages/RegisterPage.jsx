// RegisterPage.jsx – residency‑verified user registration
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/client';
import { useTranslation } from 'react-i18next';
import { User, ShieldCheck, AlertCircle, Check } from 'lucide-react';

// 12 Meghalaya districts (used elsewhere)
const districts = [
  'East Khasi Hills',
  'West Khasi Hills',
  'South West Khasi Hills',
  'Ri Bhoi',
  'Jaintia Hills',
  'West Jaintia Hills',
  'East Jaintia Hills',
  'East Garo Hills',
  'West Garo Hills',
  'South Garo Hills',
  'North Garo Hills',
  'Mawphlang',
];

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState(districts[0]);
  const [proofFile, setProofFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!proofFile) {
      setError(t('register.proof_required', 'Please upload a residency proof document.'));
      return;
    }
    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('password', password);
    formData.append('district', district);
    formData.append('proof', proofFile);
    setIsSubmitting(true);
    try {
      await register(formData);
      setSuccess(t('register.success_msg', 'Registration submitted! Your account is pending verification.'));
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || t('register.failed_msg', 'Registration failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F6] dark:bg-black flex items-center justify-center p-4 selection:bg-[#006B4F] selection:text-white transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-2xl p-7 sm:p-9 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex p-2 rounded-2xl bg-black border border-[#D9E2DE] dark:border-[#27272A] shadow-sm">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('register.title', 'Register for NER Landslide Portal')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">{t('register.subtitle', 'Provide residency proof to activate your account.')}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-[#E63946] flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}
        {/* Success */}
        {success && (
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/40 text-xs text-[#2F855A] flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label htmlFor="reg-username" className="block font-semibold text-slate-700 dark:text-zinc-300">
              {t('register.username', 'Username')} <span className="text-[#E63946]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="reg-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. johndoe"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] font-medium transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="block font-semibold text-slate-700 dark:text-zinc-300">
              {t('register.password', 'Password')} <span className="text-[#E63946]">*</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="reg-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] font-medium transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-district" className="block font-semibold text-slate-700 dark:text-zinc-300">
              {t('register.district', 'District')}
            </label>
            <select
              id="reg-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full pl-3 pr-3 py-2.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-900 dark:text-white focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] font-medium transition-all"
            >
              {districts.map((d) => (
                <option key={d} value={d}> {d} </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-proof" className="block font-semibold text-slate-700 dark:text-zinc-300">
              {t('register.residency_proof', 'Residency Proof (PDF, JPG, PNG)')} <span className="text-[#E63946]">*</span>
            </label>
            <input
              id="reg-proof"
              type="file"
              accept="application/pdf,image/*"
              required
              onChange={(e) => setProofFile(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#006B4F] file:text-white hover:file:bg-[#00523C]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-[#006B4F] hover:bg-[#00523C] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? t('register.submitting', 'Submitting...') : t('register.create_account', 'Create Account')}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-zinc-400">
          {t('register.already_account', 'Already have an account?')}{' '}
          <Link to="/login" className="text-[#006B4F] dark:text-emerald-400 font-bold hover:underline">
            {t('register.sign_in', 'Sign In')}
          </Link>
        </div>
      </div>
    </div>
  );
}
