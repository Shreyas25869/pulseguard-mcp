import React, { useState } from 'react';
import { 
  Shield, Volume2, VolumeX, Send, RefreshCw, 
  Tv, Smartphone, Terminal, SplitSquareVertical
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
    { id: 'split', label: 'Split', icon: SplitSquareVertical },
    { id: 'echoshow', label: 'Echo Show', icon: Tv },
    { id: 'caregiver', label: 'Caregiver', icon: Smartphone },
    { id: 'developer', label: 'Developer', icon: Terminal },
  ];

  return (
    <header className="border-b border-white/80 bg-white/70 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Brand: Clean Icon + Logo + MCP Badge */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-all ${
              status === 'escalated' 
                ? 'bg-red-600 shadow-red-500/30 animate-pulse' 
                : 'bg-gradient-to-tr from-sky-500 to-cyan-500 shadow-sky-500/25'
            }`}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            {status === 'escalated' && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight text-slate-900">PulseGuard</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-700 border border-sky-400/20 backdrop-blur-xs">
              MCP
            </span>
          </div>
        </div>

        {/* View Switcher: Minimal, Modern Segmented Pill */}
        <nav className="flex items-center bg-slate-200/50 backdrop-blur-md border border-white/80 rounded-xl p-1 gap-1 shadow-inner">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white text-sky-700 font-semibold shadow-sm border border-white/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions: Compact Prompt + Voice Audio + Reset */}
        <div className="flex items-center gap-2">
          {/* Compact Prompt Input */}
          <form onSubmit={handleSubmit} className="relative w-40 sm:w-52 hidden sm:block">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Ask Alexa+..."
              disabled={isProcessing}
              className="w-full bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white/90 focus:ring-2 focus:ring-sky-400/15 transition-all disabled:opacity-50 shadow-xs"
            />
            <button
              type="submit"
              disabled={!promptText.trim() || isProcessing}
              className="absolute right-1 top-1 p-1 rounded-lg text-slate-400 hover:text-sky-600 disabled:opacity-30 cursor-pointer transition-colors"
              title="Submit prompt to Alexa+"
            >
              {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin text-sky-500" /> : <Send className="w-3 h-3" />}
            </button>
          </form>

          {/* Voice Toggle */}
          <button
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              if (!voiceEnabled) playAlexaChime('success');
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              voiceEnabled
                ? 'bg-sky-500/10 border-sky-400/30 text-sky-700 backdrop-blur-md'
                : 'bg-white/60 border-slate-200/80 text-slate-600 hover:text-slate-900 backdrop-blur-md'
            }`}
            title={voiceEnabled ? 'Mute synthesized Alexa voice' : 'Enable synthesized Alexa voice'}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-600" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{voiceEnabled ? 'Voice' : 'Muted'}</span>
          </button>

          {/* Reset Baseline */}
          <button
            onClick={onReset}
            disabled={isProcessing}
            className="p-2 rounded-xl border border-slate-200/80 bg-white/60 hover:bg-white/90 text-slate-600 hover:text-slate-900 backdrop-blur-md transition-all cursor-pointer disabled:opacity-40 shadow-xs"
            title="Reset telemetry & perimeter to baseline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
