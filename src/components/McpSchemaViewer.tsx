import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal } from 'lucide-react';

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
    <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" /> Model Context Protocol (MCP) Tools
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Registered on SSE Transport <span className="font-mono text-cyan-400 font-semibold">/mcp/sse</span> for Alexa+ Bedrock loop
          </p>
        </div>
        <button
          onClick={handleCopyEndpoint}
          className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700/80 flex items-center gap-1.5 font-mono transition-all cursor-pointer shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Copied' : 'Copy SSE URL'}</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {schemas.map((s) => (
          <div 
            key={s.name} 
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all text-xs group"
          >
            <div className="flex items-center justify-between font-mono mb-1.5">
              <span className="text-cyan-400 font-semibold group-hover:text-cyan-300 transition-colors">
                {s.name}()
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {s.args}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};