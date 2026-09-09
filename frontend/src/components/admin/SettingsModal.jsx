import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { X, Settings, Sun, Moon, Database, Shield, Bell } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { isDark, toggleTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#D9E2DE] dark:border-[#1E1E24] bg-[#F8FAF9] dark:bg-[#121215]">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#006B4F] dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-[#1F2937] dark:text-white">Portal Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Appearance */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-zinc-200 block">Theme & Appearance</label>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A]">
              <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-slate-700" />}
                <span>{isDark ? 'Dark Theme (True Black)' : 'Light Theme (Government Standard)'}</span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3 py-1 rounded-md bg-[#006B4F] text-white text-[11px] font-bold hover:bg-[#00523C] transition-colors"
              >
                Toggle
              </button>
            </div>
          </div>

          {/* Telemetry Config */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-zinc-200 block">API Configuration</label>
            <div className="p-3 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Endpoint:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">http://127.0.0.1:8001/api</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Mock Data:</span>
                <span className="font-mono text-slate-700 dark:text-zinc-300 font-semibold">Disabled (Real PostGIS DB)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Map Tile Provider:</span>
                <span className="text-slate-700 dark:text-zinc-300">CARTO Voyager & ESRI Aerial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D9E2DE] dark:border-[#1E1E24] bg-[#F8FAF9] dark:bg-[#121215] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#006B4F] hover:bg-[#00523C] text-white font-semibold text-xs transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
