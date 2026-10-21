import React from 'react';
import { Database, ShieldCheck, Clock, FileText } from 'lucide-react';
import { CareAuditEntry } from '../types.js';

interface CareLedgerProps {
  logs: CareAuditEntry[];
}

export const CareLedger: React.FC<CareLedgerProps> = ({ logs }) => {
  return (
    <div className="glass-panel rounded-3xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-sky-600" /> Cloud Care Ledger (Amazon DynamoDB)
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Immutable incident audits & caregiver handoff logs
          </p>
        </div>
        <span className="glass-pill text-[10px] px-2.5 py-0.5 rounded-full text-slate-700 font-mono shadow-2xs">
          Table: pulseguard_care_events
        </span>
      </div>

      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {logs.map((entry) => {
          const isCritical = entry.severity === 'critical' || entry.severity === 'emergency';
          const isWarning = entry.severity === 'warning';

          return (
            <div
              key={entry.id}
              className={`p-3 rounded-2xl border text-xs transition-all shadow-xs ${
                isCritical
                  ? 'bg-gradient-to-r from-red-500/15 via-rose-500/10 to-white/80 backdrop-blur-md border-red-300 text-red-950'
                  : isWarning
                  ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-white/80 backdrop-blur-md border-amber-300 text-amber-950'
                  : 'glass-card border-slate-200/80 text-slate-800 hover:border-sky-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-sky-700">
                    {entry.id}
                  </span>
                  <span className="glass-pill text-[10px] px-2 py-0.5 rounded text-slate-700 font-mono uppercase font-semibold shadow-2xs">
                    {entry.eventType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>

              <p className="font-medium text-slate-900 mb-1">{entry.summary}</p>
              <p className="text-[11px] text-slate-600 italic mb-1.5 leading-relaxed">
                "{entry.agentReasoning}"
              </p>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[10px]">
                <span className="text-teal-700 font-semibold flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3" /> {entry.outcome}
                </span>
                <span className="text-slate-400 font-mono">
                  Tools: {entry.toolsInvoked.join(', ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
