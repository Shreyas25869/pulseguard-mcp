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
      color: 'from-red-500/20 to-rose-500/10 border-red-500/50 text-red-200 hover:border-red-400',
      activeRing: 'ring-2 ring-red-500 shadow-lg shadow-red-500/20 bg-red-950/40 border-red-500'
    },
    {
      id: 'missed_meds' as const,
      name: 'Overdue Heart Medication',
      badge: 'Scenario 2',
      shortDesc: 'Slot 3 Eliquis · BP 148/94 · Voice Prompt',
      icon: Pill,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/50 text-amber-200 hover:border-amber-400',
      activeRing: 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20 bg-amber-950/40 border-amber-500'
    },
    {
      id: 'first_responder_arrival' as const,
      name: 'Paramedics at Ring Doorbell',
      badge: 'Scenario 3',
      shortDesc: 'Ring Pro Feed · Intercom · Code Staging',
      icon: Shield,
      color: 'from-sky-500/20 to-blue-500/10 border-sky-500/50 text-sky-200 hover:border-sky-400',
      activeRing: 'ring-2 ring-sky-500 shadow-lg shadow-sky-500/20 bg-sky-950/40 border-sky-500'
    },
    {
      id: 'reset_normal' as const,
      name: 'Healthy Normal Baseline',
      badge: 'Reset',
      shortDesc: '72 BPM · Vitals Stable · Perimeter Secured',
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/50 text-emerald-200 hover:border-emerald-400',
      activeRing: 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20 bg-emerald-950/40 border-emerald-500'
    }
  ];

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 backdrop-blur-md shadow-lg space-y-2.5">
      {/* Top Banner: Explanation Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Zap className="w-4 h-4 text-sky-400" />
          <span>Interactive Demo Scenarios:</span>
          <span className="text-slate-400 font-normal hidden sm:inline">
            Click any button below to trigger the Alexa+ Agent & MCP tool loop
          </span>
        </div>

        {/* 4-Step Architecture Flow */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800">
          <span className="text-sky-400">1. Sensor Telemetry</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="text-amber-400">2. Bedrock Reasoning</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="text-cyan-400">3. MCP Tools</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="text-emerald-400">4. Action / Unlock</span>
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
              className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden group flex flex-col justify-between ${
                isActive ? s.activeRing : `bg-gradient-to-r ${s.color} bg-slate-950/50`
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold truncate text-white">{s.name}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300">
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
