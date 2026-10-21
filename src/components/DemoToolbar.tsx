import React from 'react';
import { AlertTriangle, Pill, Shield, CheckCircle2, Sparkles, ArrowRight, Zap, Play } from 'lucide-react';

interface DemoToolbarProps {
  onTrigger: (scenarioId: 'fall_emergency' | 'missed_meds' | 'first_responder_arrival' | 'reset_normal') => void;
  isProcessing: boolean;
  activeScenario?: string;
}

export const DemoToolbar: React.FC<DemoToolbarProps> = ({
  onTrigger,
  isProcessing,
  activeScenario
}) => {
  const scenarios = [
    {
      id: 'fall_emergency' as const,
      name: 'Critical Fall & Tachycardia',
      badge: 'Scenario 1',
      shortDesc: '3.85G Fall · 142 BPM · Deadbolt Auto-Unlock',
      icon: AlertTriangle,
      color: 'from-red-950/30 via-red-900/10 to-transparent border-red-900/50 text-red-200 hover:border-red-500/70',
      activeRing: 'ring-2 ring-red-500 shadow-lg shadow-red-500/20 bg-red-950/50 border-red-500 text-red-100'
    },
    {
      id: 'missed_meds' as const,
      name: 'Overdue Heart Medication',
      badge: 'Scenario 2',
      shortDesc: 'Slot 3 Eliquis · BP 148/94 · Voice Prompt',
      icon: Pill,
      color: 'from-amber-950/30 via-amber-900/10 to-transparent border-amber-900/50 text-amber-200 hover:border-amber-500/70',
      activeRing: 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20 bg-amber-950/50 border-amber-500 text-amber-100'
    },
    {
      id: 'first_responder_arrival' as const,
      name: 'Paramedics at Ring Doorbell',
      badge: 'Scenario 3',
      shortDesc: 'Ring Pro Feed · Intercom · Code Staging',
      icon: Shield,
      color: 'from-sky-950/30 via-sky-900/10 to-transparent border-sky-900/50 text-sky-200 hover:border-sky-500/70',
      activeRing: 'ring-2 ring-sky-500 shadow-lg shadow-sky-500/20 bg-sky-950/50 border-sky-500 text-sky-100'
    },
    {
      id: 'reset_normal' as const,
      name: 'Healthy Normal Baseline',
      badge: 'Reset',
      shortDesc: '72 BPM · Vitals Stable · Perimeter Secured',
      icon: CheckCircle2,
      color: 'from-teal-950/30 via-teal-900/10 to-transparent border-teal-900/50 text-teal-200 hover:border-teal-500/70',
      activeRing: 'ring-2 ring-teal-500 shadow-lg shadow-teal-500/20 bg-teal-950/50 border-teal-500 text-teal-100'
    }
  ];

  return (
    <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Top Banner: Explanation Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <Zap className="w-4 h-4 text-sky-400" />
          <span>Interactive Demo Scenarios:</span>
          <span className="text-slate-400 font-normal hidden sm:inline">
            Click any button below to trigger the Alexa+ Agent & MCP tool loop
          </span>
        </div>

        {/* 4-Step Architecture Flow */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-sky-400 font-medium">1. Telemetry</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-amber-400 font-medium">2. Reasoning</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-cyan-400 font-medium">3. MCP Tools</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-emerald-400 font-medium">4. Action / Unlock</span>
        </div>
      </div>

      {/* 4 Interactive Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {scenarios.map((s) => {
          const Icon = s.icon;
          const isActive = activeScenario === s.id;

          return (
            <button
              key={s.id}
              onClick={() => onTrigger(s.id)}
              disabled={isProcessing}
              className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group flex flex-col justify-between ${
                isActive ? s.activeRing : `bg-gradient-to-r ${s.color} bg-[#0b101c]/80`
              } disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold truncate text-white">{s.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/40 border border-slate-700/60 text-slate-300">
                  {s.badge}
                </span>
              </div>

              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span className="truncate">{s.shortDesc}</span>
                <Play className="w-3 h-3 text-sky-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
