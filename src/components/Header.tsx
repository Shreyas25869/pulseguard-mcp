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
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4">
        
        {/* Brand: Clean Icon + Logo + MCP Badge */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-all ${
              status === 'escalated' 
                ? 'bg-red-600 shadow-red-500/30 animate-pulse' 
                : 'bg-gradient-to-tr from-sky-500 to-cyan-400 shadow-sky-500/20'
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
            <span className="text-sm font-bold tracking-tight text-white">PulseGuard</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/80">
              MCP
            </span>
          </div>
        </div>

        {/* View Switcher: Minimal, Modern Segmented Pill */}
        <nav className="flex items-center bg-slate-900 border border-slate-800/90 rounded-xl p-1 gap-1 shadow-inner">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!promptText.trim() || isProcessing}
              className="absolute right-1 top-1 p-1 rounded-lg text-slate-400 hover:text-sky-400 disabled:opacity-30 cursor-pointer transition-colors"
              title="Submit prompt to Alexa+"
            >
              {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin text-sky-400" /> : <Send className="w-3 h-3" />}
            </button>
          </form>

          {/* Voice Toggle */}
          <button
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              if (!voiceEnabled) playAlexaChime('success');
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              voiceEnabled
                ? 'bg-sky-950/80 border-sky-800 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={voiceEnabled ? 'Mute synthesized Alexa voice' : 'Enable synthesized Alexa voice'}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{voiceEnabled ? 'Voice' : 'Muted'}</span>
          </button>

          {/* Reset Baseline */}
          <button
            onClick={onReset}
            disabled={isProcessing}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-40"
            title="Reset telemetry & perimeter to baseline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
