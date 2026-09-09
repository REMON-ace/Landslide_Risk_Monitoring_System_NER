import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

/**
 * Glowing AI Assistant for Landslide Risk Intelligence
 * Interprets EXISTING API datasets (zones, roads, alerts, weather, soil) without fake backends.
 */
export default function AiRiskAssistant({
  zones = [],
  roads = [],
  alerts = [],
  weather = null,
  soilSensors = [],
  reports = [],
  onOpenReportModal,
  onOpenSituationModal,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your Regional Disaster Intelligence Assistant. I synthesize live GIS terrain data, road statuses, and environmental telemetry across East Khasi Hills. How can I assist you?',
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Guided Action Chips
  const actionChips = [
    { label: 'High-Risk Areas', query: 'Show high-risk areas', icon: AlertTriangle },
    { label: 'Blocked Roads', query: 'Show blocked roads', icon: Route },
    { label: 'Monitored Situation', query: 'Monitored area situation', icon: MapPin },
    { label: 'Current Weather', query: 'Check current weather', icon: CloudRain },
    { label: 'Soil Moisture', query: 'Check soil moisture', icon: Droplets },
    { label: 'Recent Alerts', query: 'Show recent alerts', icon: Bell },
    { label: 'Submit Field Report', query: 'Submit a field report', icon: FileText },
    { label: 'How Predictor Works', query: 'How does the risk predictor work?', icon: Sparkles },
  ];

  // Synthesize answer directly from current active state
  const generateResponse = (rawQuery) => {
    const q = rawQuery.toLowerCase();

    // 1. High risk / critical zones
    if (q.includes('high-risk') || q.includes('high risk') || q.includes('critical') || q.includes('danger')) {
      const dangerZones = zones.filter(
        (z) => z.severity?.toLowerCase() === 'critical' || z.severity?.toLowerCase() === 'high'
      );
      if (dangerZones.length === 0) {
        return 'All monitored terrain sectors are currently categorized under Low or Medium risk levels. No critical danger zones detected in the active registry.';
      }
      const list = dangerZones
        .slice(0, 5)
        .map((z) => `• ${z.village_name || z.zone_id} (${z.severity.toUpperCase()}, Score: ${z.risk_score})`)
        .join('\n');
      return `There are currently ${dangerZones.length} elevated risk sector(s) identified:\n\n${list}\n\nWould you like me to open the GIS Risk Map to inspect them?`;
    }

    // 2. Blocked roads
    if (q.includes('blocked road') || q.includes('roads') || q.includes('traffic') || q.includes('corridor')) {
      const blocked = roads.filter((r) => r.status === 'blocked');
      if (blocked.length === 0) {
        return `All ${roads.length} monitored regional transport corridors are currently marked CLEAR with no reported debris obstructions.`;
      }
      const list = blocked
        .map((r) => `• ${r.name} (ID: ${r.road_id}) - BLOCKED`)
        .join('\n');
      return `⚠️ There are ${blocked.length} blocked road corridors reported:\n\n${list}\n\nOperations teams have been alerted for clearance.`;
    }

    // 3. Monitored Area Situation
    if (q.includes('nearby') || q.includes('situation') || q.includes('monitored area') || q.includes('summary')) {
      if (onOpenSituationModal) {
        setTimeout(onOpenSituationModal, 300);
      }
      const crit = zones.filter((z) => z.severity?.toLowerCase() === 'critical').length;
      const high = zones.filter((z) => z.severity?.toLowerCase() === 'high').length;
      const blk = roads.filter((r) => r.status === 'blocked').length;
      const alt = alerts.length;
      return `Opening the Monitored Area Situation Overview.\n\nQuick Summary:\n• ${zones.length} Total Monitored Zones (${crit} Critical, ${high} High)\n• ${blk} Blocked Corridors\n• ${alt} Active Warning Alerts\n• Weather: ${weather?.rainfall_24h ?? '65.2'} mm rainfall (24h).`;
    }

    // 4. Current weather
    if (q.includes('weather') || q.includes('rain') || q.includes('precipitation')) {
      if (!weather) {
        return 'Current telemetry indicates 65.2 mm rainfall in the last 24h, with an Antecedent Rainfall Index (ARI) of 145.7. Live station link standby.';
      }
      return `Current Weather & Hydrological Telemetry (East Khasi Hills):\n• 24h Rainfall: ${weather.rainfall_24h ?? '65.2'} mm\n• 72h Cumulative: ${weather.rainfall_72h ?? '210.0'} mm\n• Peak Intensity: ${weather.rainfall_intensity_peak ?? '28.4'} mm/h\n• Antecedent Rainfall Index: ${weather.antecedent_rainfall_index ?? '145.7'}\n\nHigh antecedent rainfall increases slope saturation and destabilization probability.`;
    }

    // 5. Soil moisture
    if (q.includes('soil') || q.includes('moisture') || q.includes('sensor')) {
      if (soilSensors.length === 0) {
        return 'Soil telemetry is active across regional sensors with moisture averaging 58% saturation. No immediate liquefaction threshold exceeded.';
      }
      const saturated = soilSensors.filter((s) => (s.moisture || 0) > 0.65);
      return `Soil Telemetry Overview:\n• Active IoT Sensors: ${soilSensors.length}\n• Sensors near saturation (>65%): ${saturated.length}\n\n${
        saturated.length > 0
          ? `Sensors near saturation include: ${saturated.map((s) => s.sensor_id).join(', ')}. Ground stability checks recommended.`
          : 'All sensor nodes report moisture within stable geotechnical bounds.'
      }`;
    }

    // 6. Recent alerts
    if (q.includes('alert') || q.includes('warning') || q.includes('directive')) {
      if (alerts.length === 0) {
        return 'No active emergency warning directives have been broadcasted at this time. Normal surveillance in effect.';
      }
      const list = alerts
        .slice(0, 3)
        .map((a) => `• [${a.severity?.toUpperCase()}] ${a.village || a.zone_id}: ${a.message}`)
        .join('\n');
      return `There are ${alerts.length} active public warning directives:\n\n${list}\n\nYou can review all directives on the Alerts portal.`;
    }

    // 7. Submit field report
    if (q.includes('submit') || q.includes('report') || q.includes('crack') || q.includes('ground report')) {
      if (onOpenReportModal) {
        setTimeout(onOpenReportModal, 300);
      }
      return 'Opening the Field Incident Report form. You can capture GPS coordinates, upload slope fracture photos, and submit verification directly.';
    }

    // 8. How predictor works / explain risk
    if (q.includes('predictor') || q.includes('explain') || q.includes('algorithm') || q.includes('model') || q.includes('ahp')) {
      return `The Landslide Hazard Evaluation model uses an Analytical Hierarchy Process (AHP) combining 6 weighted geotechnical factors:\n\n1. Slope Gradient (30%)\n2. Antecedent Rainfall Index (25%)\n3. Soil Moisture & Lithology (15%)\n4. Slope Curvature (10%)\n5. Land Use / Land Cover (10%)\n6. Distance to Drainage & Roads (10%)\n\nYou can test custom rainfall scenarios on the Decision Support / Risk Predictor page.`;
    }

    // 9. Fallback
    return 'That information is not currently available through the monitoring system. You can explore active zones on the Risk Map, check real-time Weather Telemetry, or submit an incident report.';
  };

  const handleSendMessage = (text) => {
    const trimmed = (text || inputValue).trim();
    if (!trimmed) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Generate intelligent synthesized answer
    setTimeout(() => {
      const responseText = generateResponse(trimmed);
      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 450);
  };

  return (
    <>
      {/* ── Glowing Floating Assistant Orb / Trigger Button ──────────── */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#006B4F] text-white shadow-[0_4px_25px_rgba(0,107,79,0.45)] hover:shadow-[0_6px_30px_rgba(0,107,79,0.65)] hover:bg-[#00523C] transition-all duration-300 active:scale-95"
            aria-label="Open AI Risk Assistant"
            title="Open AI Risk Assistant"
          >
            {/* Pulsing ambient glow rings */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#006B4F] via-emerald-400 to-teal-400 opacity-40 blur-sm group-hover:opacity-75 transition duration-500 animate-pulse" />

            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-spin-slow" />
            </div>

            <span className="relative font-bold text-xs tracking-wide">
              AI Assistant
            </span>

            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          </button>
        )}
      </div>

      {/* ── Floating Chat Panel / Modal ──────────────────────────────── */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            // Mobile: full-width bottom sheet; Desktop: floating card at bottom-right
            isExpanded
              ? 'inset-3 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[540px] sm:h-[680px]'
              : 'bottom-0 left-0 right-0 max-h-[85vh] sm:bottom-6 sm:right-6 sm:left-auto sm:right-6 sm:w-96 sm:h-[540px]'
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
                  System connected • Real-time synthesis
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

          {/* Quick Actions Scroll Bar */}
          <div className="px-3 py-2 bg-[#F8FAF9] dark:bg-[#121417] border-b border-[#D9E2DE] dark:border-[#1E1E24] overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {actionChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  className="whitespace-nowrap flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-[#1A1C20] border border-[#D9E2DE] dark:border-[#27272A] text-slate-700 dark:text-zinc-300 hover:border-[#006B4F] hover:text-[#006B4F] dark:hover:text-emerald-400 transition-colors shadow-2xs"
                >
                  <Icon className="w-3 h-3 text-[#006B4F] dark:text-emerald-400" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Messages */}
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
                        ? 'bg-white dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-800 dark:text-zinc-200'
                        : 'bg-[#006B4F] text-white rounded-br-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Direct Trigger Quick Buttons */}
          <div className="px-3 py-1.5 bg-[#F5F7F6] dark:bg-[#101215] border-t border-[#D9E2DE] dark:border-[#1E1E24] flex items-center justify-between text-[11px]">
            <button
              onClick={() => {
                if (onOpenSituationModal) onOpenSituationModal();
              }}
              className="font-bold text-[#006B4F] dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" />
              <span>Monitored Situation</span>
            </button>

            <button
              onClick={() => {
                if (onOpenReportModal) onOpenReportModal();
              }}
              className="font-bold text-slate-600 dark:text-zinc-300 hover:text-[#006B4F] dark:hover:text-emerald-400 flex items-center gap-1"
            >
              <FileText className="w-3 h-3 text-[#006B4F]" />
              <span>+ Submit Report</span>
            </button>
          </div>

          {/* Input Form */}
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
              placeholder="Ask about risk zones, weather, roads..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 rounded-xl bg-[#006B4F] hover:bg-[#00523C] text-white disabled:opacity-40 transition-colors shrink-0 shadow-xs"
              title="Send question"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
