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
      color: 'from-red-50 to-rose-50 border-red-200 text-red-700 hover:border-red-400',
      activeRing: 'ring-2 ring-red-500 shadow-md shadow-red-500/10 bg-red-50 border-red-500 text-red-900'
    },
    {
      id: 'missed_meds' as const,
      name: 'Overdue Heart Medication',
      badge: 'Scenario 2',
      shortDesc: 'Slot 3 Eliquis · BP 148/94 · Voice Prompt',
      icon: Pill,
      color: 'from-amber-50 to-orange-50 border-amber-200 text-amber-700 hover:border-amber-400',
      activeRing: 'ring-2 ring-amber-500 shadow-md shadow-amber-500/10 bg-amber-50 border-amber-500 text-amber-900'
    },
    {
      id: 'first_responder_arrival' as const,
      name: 'Paramedics at Ring Doorbell',
      badge: 'Scenario 3',
      shortDesc: 'Ring Pro Feed · Intercom · Code Staging',
      icon: Shield,
      color: 'from-sky-50 to-blue-50 border-sky-200 text-sky-700 hover:border-sky-400',
      activeRing: 'ring-2 ring-sky-500 shadow-md shadow-sky-500/10 bg-sky-50 border-sky-500 text-sky-900'
    },
    {
      id: 'reset_normal' as const,
      name: 'Healthy Normal Baseline',
      badge: 'Reset',
      shortDesc: '72 BPM · Vitals Stable · Perimeter Secured',
      icon: CheckCircle2,
      color: 'from-teal-50 to-emerald-50 border-teal-200 text-teal-700 hover:border-teal-400',
      activeRing: 'ring-2 ring-teal-500 shadow-md shadow-teal-500/10 bg-teal-50 border-teal-500 text-teal-900'
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
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
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
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
              className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden group flex flex-col justify-between ${
                isActive ? s.activeRing : `bg-gradient-to-r ${s.color}`
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-xs`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold truncate text-slate-900">{s.name}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/80 border border-slate-200/80 text-slate-700 font-medium">
                  {s.badge}
                </span>
              </div>

              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
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
