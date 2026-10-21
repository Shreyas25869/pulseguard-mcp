import React, { useState } from 'react';
import { Terminal, Cpu, CheckCircle, ChevronDown, ChevronRight, Layers, ShieldCheck, Database, Wrench } from 'lucide-react';
import { AgentExecutionResult, AgentActionStep } from '../types.js';

interface AgentInspectorProps {
  execution: AgentExecutionResult | null;
  isProcessing: boolean;
}

export const AgentInspector: React.FC<AgentInspectorProps> = ({ execution, isProcessing }) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: true });

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps(prev => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden flex flex-col h-full min-h-[580px]">
      {/* Panel Header */}
      <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Alexa+ Agent Reasoning Trace & MCP Tool Inspector
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-mono text-slate-300 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" /> Bedrock Nova-Pro
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
            execution?.usedLiveBedrock 
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
              : 'bg-sky-950 text-sky-400 border border-sky-800'
          }`}>
            {execution?.usedLiveBedrock ? 'AWS Bedrock Live' : 'Bedrock Autonomous Engine'}
          </span>
        </div>
      </div>

      {/* Steps List */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
        {isProcessing && (
          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/60 animate-pulse flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="text-xs font-semibold text-sky-200">Bedrock Agent executing autonomous tool loop...</p>
              <p className="text-[11px] text-sky-400 font-mono">Evaluating Model Context Protocol (MCP) tool schemas</p>
            </div>
          </div>
        )}

        {!execution && !isProcessing && (
          <div className="text-center py-16 text-slate-500">
            <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-medium text-slate-400">No agent actions recorded yet.</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Click any scenario button on the right to watch Alexa+ trigger autonomous MCP tool calls in real time.
            </p>
          </div>
        )}

        {execution?.steps.map((step: AgentActionStep) => {
          const isExpanded = !!expandedSteps[step.step];

          return (
            <div
              key={step.step}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden transition-all hover:border-slate-700"
            >
              {/* Step Header */}
              <button
                onClick={() => toggleStep(step.step)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-lg bg-sky-950 border border-sky-800 text-sky-400 text-[11px] font-mono font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {step.toolCall ? (
                      <span className="font-mono text-cyan-400">
                        mcp::{step.toolCall.name}()
                      </span>
                    ) : (
                      <span className="text-slate-300">Agent Speech Synthesis</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Step Body */}
              {isExpanded && (
                <div className="px-4 pb-3.5 pt-1 space-y-2 border-t border-slate-800/60">
                  {/* Thought / Reason */}
                  <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                    <span className="text-sky-400 font-semibold font-mono text-[11px] block mb-0.5">Thought:</span>
                    {step.thought}
                  </div>

                  {/* Tool Arguments */}
                  {step.toolCall && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Input Arguments:
                      </span>
                      <pre className="text-[11px] font-mono bg-slate-900 text-emerald-300 p-2.5 rounded-xl border border-slate-800 overflow-x-auto">
                        {JSON.stringify(step.toolCall.arguments, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Tool Result */}
                  {step.toolResult && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Tool Return (MCP Payload):
                      </span>
                      <pre className="text-[11px] font-mono bg-slate-900 text-sky-300 p-2.5 rounded-xl border border-slate-800 overflow-x-auto max-h-40">
                        {JSON.stringify(step.toolResult, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Spoken Output */}
                  {step.speechOutput && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold">
                        Spoken Response:
                      </span>
                      <div className="text-xs text-slate-100 bg-slate-900/80 p-2.5 rounded-xl border border-rose-900/40 italic">
                        "{step.speechOutput}"
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-950 px-5 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-mono">
          <Database className="w-3.5 h-3.5 text-slate-400" /> DynamoDB Audit Ledger Synced
        </span>
        <span className="font-mono text-slate-400">
          Tools: 5 Registered
        </span>
      </div>
    </div>
  );
};
