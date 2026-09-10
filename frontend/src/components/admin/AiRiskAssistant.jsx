import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  AlertTriangle,
  Route,
  CloudRain,
  Droplets,
  Bell,
  FileText,
  MapPin,
  Maximize2,
  Minimize2,
  Loader2,
} from 'lucide-react';
import { sendChatMessage } from '../../api/client';

/**
 * AI Risk Assistant — calls the real /api/chat backend which:
 * 1. Fetches live data from PostgreSQL (Supabase)
 * 2. Uses Google Gemini to answer grounded on that data only
 * Falls back to a friendly error if backend is unavailable.
 */
export default function AiRiskAssistant({
  onOpenReportModal,
  onOpenSituationModal,
  showAdminActions = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // history tracks turns for multi-turn context
  const [history, setHistory] = useState([]);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your Regional Disaster Intelligence Assistant. I can answer questions about risk zones, blocked roads, alerts, and field reports — all sourced directly from the live monitoring database. How can I help?',
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  // Guided Action Chips
  const actionChips = [
    { label: 'High-Risk Areas',      query: 'Show all high-risk and critical zones',           icon: AlertTriangle },
    { label: 'Blocked Roads',        query: 'Which roads are currently blocked?',               icon: Route },
    { label: 'Monitored Situation',  query: 'Give me an overall situation summary',             icon: MapPin },
    { label: 'Recent Alerts',        query: 'Show the most recent emergency alerts',            icon: Bell },
    { label: 'Field Reports',        query: 'List the latest field reports in the system',      icon: FileText },
    { label: 'Current Weather',      query: 'What is the current weather and rainfall status?', icon: CloudRain },
    { label: 'Soil Moisture',        query: 'What is the current soil moisture status?',        icon: Droplets },
    { label: 'Risk Predictor',       query: 'How does the landslide risk predictor work?',      icon: Sparkles },
  ];

  const handleSendMessage = useCallback(async (text) => {
    const trimmed = (text || inputValue).trim();
    if (!trimmed || isLoading) return;

    // Add user message to UI
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Build history for the API (last 6 turns)
    const apiHistory = history.slice(-6);

    try {
      const res = await sendChatMessage(trimmed, apiHistory);
      const reply = res?.reply || 'No response received from the system.';

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        source: res?.source,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Persist turn for context
      setHistory((prev) => [
        ...prev,
        { role: 'user', text: trimmed },
        { role: 'assistant', text: reply },
      ]);
    } catch (err) {
      console.error('Chat API error:', err);
      const errMsg = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text:
          err?.status === 0 || !navigator.onLine
            ? 'The monitoring system is currently offline. Please check your connection.'
            : `Unable to reach the AI assistant: ${err.message || 'Unknown error'}. The backend may be restarting.`,
        isError: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, history]);

  return (
    <>
      {/* ── Floating Trigger Button ─────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#006B4F] text-white shadow-[0_4px_25px_rgba(0,107,79,0.45)] hover:shadow-[0_6px_30px_rgba(0,107,79,0.65)] hover:bg-[#00523C] transition-all duration-300 active:scale-95"
            aria-label="Open AI Risk Assistant"
            title="Open AI Risk Assistant"
          >
            {/* Pulsing ambient glow */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#006B4F] via-emerald-400 to-teal-400 opacity-40 blur-sm group-hover:opacity-75 transition duration-500 animate-pulse" />

            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            </div>

            <span className="relative font-bold text-xs tracking-wide">AI Assistant</span>

            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          </button>
        )}
      </div>

      {/* ── Chat Panel ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isExpanded
              ? 'inset-3 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[540px] sm:h-[680px]'
              : 'bottom-0 left-0 right-0 max-h-[85vh] sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 sm:h-[540px]'
          } flex flex-col bg-white dark:bg-[#0D0E10] border border-[#006B4F]/30 dark:border-emerald-500/30 rounded-t-3xl sm:rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.25)] dark:shadow-[0_12px_45px_rgba(0,0,0,0.7)] overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#006B4F] to-[#00523C] text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#006B4F]" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                  AI Risk Assistant
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-white/20 text-emerald-100">
                    GIS
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-100/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Live database • Gemini powered
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:inline-flex p-1.5 rounded-lg text-emerald-100 hover:bg-white/15 transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-emerald-100 hover:bg-white/15 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-[#F8FAF9] dark:bg-[#121417] border-b border-[#D9E2DE] dark:border-[#1E1E24] overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {actionChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  disabled={isLoading}
                  className="whitespace-nowrap flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-[#1A1C20] border border-[#D9E2DE] dark:border-[#27272A] text-slate-700 dark:text-zinc-300 hover:border-[#006B4F] hover:text-[#006B4F] dark:hover:text-emerald-400 transition-colors shadow-2xs disabled:opacity-50"
                >
                  <Icon className="w-3 h-3 text-[#006B4F] dark:text-emerald-400" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-black/30 text-xs">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isAssistant ? 'items-start' : 'items-end justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-lg bg-[#006B4F]/10 dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-[#006B4F]/20">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-2xs text-xs whitespace-pre-wrap leading-relaxed ${
                      isAssistant
                        ? msg.isError
                          ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300'
                          : 'bg-white dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-800 dark:text-zinc-200'
                        : 'bg-[#006B4F] text-white rounded-br-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-6 h-6 rounded-lg bg-[#006B4F]/10 dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-[#006B4F]/20">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] rounded-2xl px-3.5 py-2.5 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-[#006B4F] animate-spin" />
                  <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Querying database…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Admin dashboard actions are not shown to residents. */}
          {showAdminActions && (
            <div className="px-3 py-1.5 bg-[#F5F7F6] dark:bg-[#101215] border-t border-[#D9E2DE] dark:border-[#1E1E24] flex items-center justify-between text-[11px]">
              <button
                onClick={() => { if (onOpenSituationModal) onOpenSituationModal(); }}
                className="font-bold text-[#006B4F] dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                <span>Monitored Situation</span>
              </button>
              <button
                onClick={() => { if (onOpenReportModal) onOpenReportModal(); }}
                className="font-bold text-slate-600 dark:text-zinc-300 hover:text-[#006B4F] dark:hover:text-emerald-400 flex items-center gap-1"
              >
                <FileText className="w-3 h-3 text-[#006B4F]" />
                <span>+ Submit Report</span>
              </button>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-2.5 bg-white dark:bg-[#0D0E10] border-t border-[#D9E2DE] dark:border-[#1E1E24] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about risk zones, roads, alerts…"
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 rounded-xl bg-[#006B4F] hover:bg-[#00523C] text-white disabled:opacity-40 transition-colors shrink-0 shadow-xs"
              title="Send question"
            >
              {isLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />
              }
            </button>
          </form>
        </div>
      )}
    </>
  );
}
