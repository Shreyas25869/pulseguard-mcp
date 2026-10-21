import React from 'react';
import { Database, ShieldCheck, Clock, FileText } from 'lucide-react';
import { CareAuditEntry } from '../types.js';

interface CareLedgerProps {
  logs: CareAuditEntry[];
}

export const CareLedger: React.FC<CareLedgerProps> = ({ logs }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-sky-600" /> Cloud Care Ledger (Amazon DynamoDB)
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Immutable incident audits & caregiver handoff logs
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono">
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
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : isWarning
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-sky-700">
                    {entry.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono uppercase font-semibold">
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

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/80 text-[10px]">
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
