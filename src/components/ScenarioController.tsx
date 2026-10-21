import React from 'react';
import { AlertTriangle, Pill, Shield, CheckCircle2, Play, Activity } from 'lucide-react';

interface ScenarioControllerProps {
  onTrigger: (scenarioId: 'fall_emergency' | 'missed_meds' | 'first_responder_arrival' | 'reset_normal') => void;
  isProcessing: boolean;
  activeScenario?: string;
}

export const ScenarioController: React.FC<ScenarioControllerProps> = ({
  onTrigger,
  isProcessing,
  activeScenario
}) => {
  const scenarios = [
    {
      id: 'fall_emergency' as const,
      title: '1. Fall with Tachycardia',
      subtitle: '3.85G Impact · 142 BPM Tachycardia · Hallway',
      description: 'Triggers autonomous Alexa+ MCP loop: reads vitals, unlocks Ring Deadbolt, stages EMT dispatch, and initiates calm voice triage.',
      badge: 'Critical Emergency',
      badgeColor: 'bg-red-950 text-red-300 border-red-700',
      borderColor: 'hover:border-red-500',
      activeColor: 'border-red-500 bg-red-950/20',
      icon: AlertTriangle,
      iconColor: 'text-red-400'
    },
    {
      id: 'missed_meds' as const,
      title: '2. Missed Anticoagulant (Eliquis)',
      subtitle: 'Slot 3 · 140 Minutes Overdue · Elevated BP',
      description: 'Queries dispenser sensors via check_medication_adherence(), correlates with 148/94 BP, highlights Echo Show slot, and speaks reminder.',
      badge: 'Adherence Warning',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
      borderColor: 'hover:border-amber-500',
      activeColor: 'border-amber-500 bg-amber-950/20',
      icon: Pill,
      iconColor: 'text-amber-400'
    },
    {
      id: 'first_responder_arrival' as const,
      title: '3. First Responders at Ring Cam',
      subtitle: 'Ring Video Doorbell Pro · Paramedics Verified',
      description: 'Interacts with Ring Video Doorbell, broadcasts arrival confirmation via Ring Intercom, and verifies deadbolt clearance.',
      badge: 'Perimeter Access',
      badgeColor: 'bg-sky-950 text-sky-300 border-sky-700',
      borderColor: 'hover:border-sky-500',
      activeColor: 'border-sky-500 bg-sky-950/20',
      icon: Shield,
      iconColor: 'text-sky-400'
    },
    {
      id: 'reset_normal' as const,
      title: '4. Baseline Normal & Ambient Check',
      subtitle: 'HR 72 BPM · SpO2 98% · Perimeter Locked',
      description: 'Restores baseline normal parameters, runs routine scheduled wellness audit, and returns Echo Show to peaceful ambient mode.',
      badge: 'Stable Baseline',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
      borderColor: 'hover:border-emerald-500',
      activeColor: 'border-emerald-500 bg-emerald-950/20',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400'
    }
  ];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-sky-400" /> Demo Scenario Launcher
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            1-Click triggers for the 2.5-minute hackathon video demo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {scenarios.map((s) => {
          const Icon = s.icon;
          const isActive = activeScenario === s.id;

          return (
            <button
              key={s.id}
              onClick={() => onTrigger(s.id)}
              disabled={isProcessing}
              className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between group disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive ? s.activeColor : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900'
              } ${s.borderColor}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${s.iconColor}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-100">{s.title}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-slate-400 mb-2">{s.subtitle}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {s.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-sky-400 font-medium group-hover:text-sky-300">
                <span>Trigger Scenario</span>
                <Play className="w-3.5 h-3.5 fill-current transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
