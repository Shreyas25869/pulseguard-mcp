import React, { useState } from 'react';
import { 
  Shield, Volume2, VolumeX, Sparkles, Send, RefreshCw, 
  Tv, Smartphone, Terminal, SplitSquareVertical, Radio
} from 'lucide-react';
import { playAlexaChime } from '../utils/audio.ts';

export type ViewMode = 'split' | 'echoshow' | 'caregiver' | 'developer';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  onSendCustomPrompt: (prompt: string) => void;
  onReset: () => void;
  isProcessing: boolean;
  status: 'monitoring' | 'escalated' | 'resolved';
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
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
    playAlexaChime('wake');
    onSendCustomPrompt(promptText.trim());
    setPromptText('');
  };

  const navTabs: { id: ViewMode; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'split', label: 'Split Executive View', icon: SplitSquareVertical },
    { id: 'echoshow', label: 'Echo Show 15 Display', icon: Tv },
    { id: 'caregiver', label: 'Caregiver Portal', icon: Smartphone },
    { id: 'developer', label: 'MCP & Cloud Hub', icon: Terminal },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-all ${
              status === 'escalated' 
                ? 'bg-red-600 shadow-red-500/40 animate-pulse' 
                : 'bg-gradient-to-tr from-sky-500 to-cyan-400 shadow-sky-500/25'
            }`}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                status === 'escalated' ? 'bg-red-400' : 'bg-sky-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                status === 'escalated' ? 'bg-red-500' : 'bg-sky-500'
              }`}></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                PulseGuard <span className="text-sky-400 font-mono text-xs px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800">MCP</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 font-mono hidden sm:inline-flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Alexa+ Open Standard
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Amazon Developer Hackathon 2026 · <span className="text-slate-300">Build, Ship, Shape</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (Crucial for "Easy to Understand") */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Voice / Chat Prompt & Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <form onSubmit={handleSubmit} className="flex-1 md:w-64 flex items-center relative">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Ask Alexa+..."
              disabled={isProcessing}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!promptText.trim() || isProcessing}
              className="absolute right-1 px-2 py-1 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-slate-950 transition-all disabled:opacity-30"
              title="Submit prompt to Alexa+"
            >
              {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            </button>
          </form>

          {/* Voice Output Toggle */}
          <button
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              if (!voiceEnabled) playAlexaChime('success');
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              voiceEnabled
                ? 'bg-sky-950/80 border-sky-700 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle synthesized Alexa audio voice output"
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{voiceEnabled ? 'Voice ON' : 'Muted'}</span>
          </button>

          {/* Reset Baseline */}
          <button
            onClick={onReset}
            disabled={isProcessing}
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-all"
            title="Reset telemetry & perimeter to baseline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
