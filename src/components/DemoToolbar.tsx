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
      color: 'from-red-500/10 via-rose-500/5 to-white/70 border-red-200/80 text-red-800 hover:border-red-400 hover:shadow-md hover:shadow-red-500/10',
      activeRing: 'ring-2 ring-red-500 shadow-md shadow-red-500/20 bg-gradient-to-r from-red-500/15 via-rose-500/10 to-white/90 border-red-500 text-red-950'
    },
    {
      id: 'missed_meds' as const,
      name: 'Overdue Heart Medication',
      badge: 'Scenario 2',
      shortDesc: 'Slot 3 Eliquis · BP 148/94 · Voice Prompt',
      icon: Pill,
      color: 'from-amber-500/10 via-orange-500/5 to-white/70 border-amber-200/80 text-amber-800 hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10',
      activeRing: 'ring-2 ring-amber-500 shadow-md shadow-amber-500/20 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-white/90 border-amber-500 text-amber-950'
    },
    {
      id: 'first_responder_arrival' as const,
      name: 'Paramedics at Ring Doorbell',
      badge: 'Scenario 3',
      shortDesc: 'Ring Pro Feed · Intercom · Code Staging',
      icon: Shield,
      color: 'from-sky-500/10 via-cyan-500/5 to-white/70 border-sky-200/80 text-sky-800 hover:border-sky-400 hover:shadow-md hover:shadow-sky-500/10',
      activeRing: 'ring-2 ring-sky-500 shadow-md shadow-sky-500/20 bg-gradient-to-r from-sky-500/15 via-cyan-500/10 to-white/90 border-sky-500 text-sky-950'
    },
    {
      id: 'reset_normal' as const,
      name: 'Healthy Normal Baseline',
      badge: 'Reset',
      shortDesc: '72 BPM · Vitals Stable · Perimeter Secured',
      icon: CheckCircle2,
      color: 'from-teal-500/10 via-emerald-500/5 to-white/70 border-teal-200/80 text-teal-800 hover:border-teal-400 hover:shadow-md hover:shadow-teal-500/10',
      activeRing: 'ring-2 ring-teal-500 shadow-md shadow-teal-500/20 bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-white/90 border-teal-500 text-teal-950'
    }
  ];

  return (
    <div className="glass-panel rounded-3xl p-4 shadow-sm space-y-3">
      {/* Top Banner: Explanation Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-semibold">
          <Zap className="w-4 h-4 text-sky-600" />
          <span>Interactive Demo Scenarios:</span>
          <span className="text-slate-500 font-normal hidden sm:inline">
            Click any button below to trigger the Alexa+ Agent & MCP tool loop
          </span>
        </div>

        {/* 4-Step Architecture Flow */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 glass-pill px-3 py-1 rounded-xl shadow-2xs">
          <span className="text-sky-600 font-semibold">1. Telemetry</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="text-amber-600 font-semibold">2. Reasoning</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="text-cyan-600 font-semibold">3. MCP Tools</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="text-teal-600 font-semibold">4. Action / Unlock</span>
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
              className={`text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden group flex flex-col justify-between backdrop-blur-md ${
                isActive ? s.activeRing : `bg-gradient-to-r ${s.color}`
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold truncate text-slate-900">{s.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg glass-pill text-slate-700 font-semibold shadow-2xs">
                  {s.badge}
                </span>
              </div>

              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 font-medium">
                <span className="truncate">{s.shortDesc}</span>
                <Play className="w-3 h-3 text-sky-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
