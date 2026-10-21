import React from 'react';
import { Database, ShieldCheck, Clock, FileText } from 'lucide-react';
import { CareAuditEntry } from '../types.js';

interface CareLedgerProps {
  logs: CareAuditEntry[];
}

export const CareLedger: React.FC<CareLedgerProps> = ({ logs }) => {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0f172a]/90 shadow-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-sky-400" /> Cloud Care Ledger (Amazon DynamoDB)
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Immutable incident audits & caregiver handoff logs
          </p>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono">
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
              className={`p-3 rounded-2xl border text-xs transition-all ${
                isCritical
                  ? 'bg-red-950/30 border-red-800/60 text-red-200'
                  : isWarning
                  ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-sky-400">
                    {entry.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono uppercase font-semibold">
                    {entry.eventType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>

              <p className="font-medium text-slate-200 mb-1">{entry.summary}</p>
              <p className="text-[11px] text-slate-400 italic mb-1.5 leading-relaxed">
                "{entry.agentReasoning}"
              </p>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
                <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3" /> {entry.outcome}
                </span>
                <span className="text-slate-500 font-mono">
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
