import React from 'react';
import { Terminal, Database, Code2, ShieldAlert, Cpu, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { McpSchemaViewer } from './McpSchemaViewer.tsx';
import { CareLedger } from './CareLedger.tsx';
import { AgentInspector } from './AgentInspector.tsx';
import { CareAuditEntry, AgentExecutionResult } from '../types.ts';

interface DeveloperHubProps {
  auditLogs: CareAuditEntry[];
  lastExecution: AgentExecutionResult | null;
  isProcessing: boolean;
}

export const DeveloperHub: React.FC<DeveloperHubProps> = ({
  auditLogs,
  lastExecution,
  isProcessing
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Architecture Overview Banner */}
      <div className="p-5 rounded-3xl glass-panel shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200/70">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-600" />
              Developer & MCP Architecture Console
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspecting the live Model Context Protocol (MCP) server, Amazon Bedrock Converse loop, and DynamoDB care ledger
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="glass-pill text-xs px-2.5 py-1 rounded-xl text-sky-700 font-mono flex items-center gap-1.5 font-medium shadow-2xs">
              <Cpu className="w-3.5 h-3.5 text-cyan-600" /> Bedrock Nova-Pro
            </span>
            <span className="glass-pill text-xs px-2.5 py-1 rounded-xl text-slate-700 font-mono shadow-2xs">
              MCP Standard 2024-11-05
            </span>
          </div>
        </div>

        {/* Technical Flow Map */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-2xl glass-card border-slate-200/80 shadow-xs">
            <span className="text-sky-700 font-bold block mb-1">1. Ambient Ingest</span>
            <span className="text-slate-600 text-[11px]">Wearable 3.85G fall & tachycardia telemetry</span>
          </div>
          <div className="p-3 rounded-2xl glass-card border-slate-200/80 shadow-xs">
            <span className="text-amber-700 font-bold block mb-1">2. Bedrock Converse</span>
            <span className="text-slate-600 text-[11px]">Evaluates clinical risk & selects MCP tools</span>
          </div>
          <div className="p-3 rounded-2xl glass-card border-slate-200/80 shadow-xs">
            <span className="text-cyan-700 font-bold block mb-1">3. MCP Server (/mcp/sse)</span>
            <span className="text-slate-600 text-[11px]">Executes smart deadbolt & emergency staging</span>
          </div>
          <div className="p-3 rounded-2xl glass-card border-slate-200/80 shadow-xs">
            <span className="text-teal-700 font-bold block mb-1">4. Cloud Ledger</span>
            <span className="text-slate-600 text-[11px]">Commits SBAR audit hash to DynamoDB table</span>
          </div>
        </div>
      </div>

      {/* Main Dev Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Agent Thought & Tool Traces (Left 6 cols) */}
        <div className="lg:col-span-6">
          <AgentInspector execution={lastExecution} isProcessing={isProcessing} />
        </div>

        {/* Schemas & Cloud Audit Logs (Right 6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <McpSchemaViewer />
          <CareLedger logs={auditLogs} />
        </div>
      </div>
    </div>
  );
};
