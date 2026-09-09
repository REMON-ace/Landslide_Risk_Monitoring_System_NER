import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { X, User, Shield, MapPin, Key, Database, Sun, Moon } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#D9E2DE] dark:border-[#1E1E24] bg-[#F8FAF9] dark:bg-[#121215]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#006B4F] dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-[#1F2937] dark:text-white">Officer Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-center gap-3.5 pb-4 border-b border-[#D9E2DE] dark:border-[#1E1E24]">
            <div className="w-12 h-12 rounded-xl bg-[#006B4F] text-white font-black flex items-center justify-center text-lg shadow-sm">
              {user?.district ? user.district[0] : 'S'}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {user?.district || 'Official Shillong'}
              </h4>
              <p className="text-[11px] text-[#006B4F] dark:text-emerald-400 font-semibold capitalize">
                {user?.role ? user.role.replace('_', ' ') : 'District Admin'}
              </p>
              <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                Jurisdiction: East Khasi Hills District
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A]">
              <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                <MapPin className="w-4 h-4 text-[#006B4F]" />
                <span>Operating Sector</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-zinc-200">Meghalaya (NER-Zone 1)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A]">
              <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                <Database className="w-4 h-4 text-[#006B4F]" />
                <span>Backend Connection</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                http://127.0.0.1:8001/api
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A]">
              <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                <Shield className="w-4 h-4 text-[#006B4F]" />
                <span>Session Status</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#006B4F] dark:bg-emerald-950/50 dark:text-emerald-400">
                Authenticated (JWT)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#D9E2DE] dark:border-[#1E1E24] bg-[#F8FAF9] dark:bg-[#121215] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#006B4F] hover:bg-[#00523C] text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
