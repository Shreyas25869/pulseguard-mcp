import React, { useState } from 'react';
import { Shield, Volume2, VolumeX, Radio, Sparkles, Send, BellRing, RefreshCw } from 'lucide-react';

interface HeaderProps {
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  onSendCustomPrompt: (prompt: string) => void;
  onReset: () => void;
  isProcessing: boolean;
  status: 'monitoring' | 'escalated' | 'resolved';
}

export const Header: React.FC<HeaderProps> = ({
  voiceEnabled,
  setVoiceEnabled,
  onSendCustomPrompt,
  onReset,
  isProcessing,
  status
}) => {
  const [promptText, setPromptText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isProcessing) return;
    onSendCustomPrompt(promptText.trim());
    setPromptText('');
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Badges */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg transition-all ${
              status === 'escalated' ? 'bg-red-600 shadow-red-500/30 animate-pulse' : 'bg-gradient-to-tr from-sky-600 to-cyan-400 shadow-sky-500/20'
            }`}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                status === 'escalated' ? 'bg-red-400' : 'bg-sky-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                status === 'escalated' ? 'bg-red-500' : 'bg-sky-500'
              }`}></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                PulseGuard <span className="text-sky-400 font-mono text-sm px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800">MCP</span>
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Alexa+ Agent Protocol
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ambient Proactive Healthcare & Emergency Copilot · <span className="text-slate-300 font-mono">Build, Ship, Shape 2026</span>
            </p>
          </div>
        </div>

        {/* Quick Voice / Chat Prompt */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-lg w-full flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Speak or test Alexa prompt: 'Check Eleanor's vitals' or 'Fall alert'..."
              disabled={isProcessing}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all disabled:opacity-50"
            />
            <Sparkles className="w-4 h-4 text-sky-400 absolute right-3 top-2.5 pointer-events-none opacity-60" />
          </div>
          <button
            type="submit"
            disabled={!promptText.trim() || isProcessing}
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-sky-500/20"
          >
            {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Ask Alexa+</span>
          </button>
        </form>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              voiceEnabled
                ? 'bg-sky-950/80 border-sky-700 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle synthesized Alexa voice output"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice ON' : 'Voice Muted'}</span>
          </button>

          <button
            onClick={onReset}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition-all"
            title="Reset telemetry & perimeter to baseline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Baseline</span>
          </button>
        </div>
      </div>
    </header>
  );
};
