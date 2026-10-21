import React, { useState } from 'react';
import { Code2, ExternalLink, Copy, Check } from 'lucide-react';

export const McpSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const schemas = [
    {
      name: 'get_patient_vitals_telemetry',
      desc: 'Retrieves real-time vital signs, accelerometer fall telemetry, posture orientation, and room presence sensor data.',
      args: '{ patientId?: string }'
    },
    {
      name: 'check_medication_adherence',
      desc: 'Queries smart dispenser slots and prescription schedules to detect missed doses, critical medication interaction warnings.',
      args: '{ patientId?: string }'
    },
    {
      name: 'control_ring_security',
      desc: 'Interacts with Ring Video Doorbell and Ring Smart Deadbolt to view perimeter camera status, unlock deadbolt for responders.',
      args: '{ action: "unlock"|"lock"|"status"|"intercom", reason: string }'
    },
    {
      name: 'dispatch_emergency_escalation',
      desc: 'Escalates critical safety event: generates SBAR clinical triage note, notifies primary caregiver via SMS/SNS.',
      args: '{ severity: "critical_emergency"|"high", sbarSummary: string, recommendedActions: string[] }'
    },
    {
      name: 'record_care_event_log',
      desc: 'Appends immutable care audit ledger record to Amazon DynamoDB for clinical review and family compliance.',
      args: '{ eventType: string, severity: string, summary: string, outcome: string }'
    }
  ];

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText('http://localhost:3001/mcp/sse');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-sky-400" /> Model Context Protocol (MCP) Tools
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Registered on SSE Transport <span className="font-mono text-cyan-400">/mcp/sse</span> for Alexa+ Clients
          </p>
        </div>
        <button
          onClick={handleCopyEndpoint}
          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 flex items-center gap-1 font-mono transition-all"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy SSE URL'}</span>
        </button>
      </div>

      <div className="space-y-2">
        {schemas.map((s) => (
          <div key={s.name} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
            <div className="flex items-center justify-between font-mono mb-1">
              <span className="text-sky-400 font-bold">{s.name}</span>
              <span className="text-[10px] text-slate-400">{s.args}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
