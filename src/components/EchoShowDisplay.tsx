import React from 'react';
import { 
  Heart, Activity, Pill, ShieldCheck, ShieldAlert, KeyRound, 
  Video, Mic, AlertTriangle, Clock, MapPin, CheckCircle2, UserCheck
} from 'lucide-react';
import { PatientVitals, MedicationItem, RingSecurityState, AgentExecutionResult } from '../types.js';

interface EchoShowDisplayProps {
  vitals: PatientVitals;
  medications: MedicationItem[];
  ring: RingSecurityState;
  lastExecution: AgentExecutionResult | null;
  isProcessing: boolean;
  onQuickAction: (actionPrompt: string) => void;
}

export const EchoShowDisplay: React.FC<EchoShowDisplayProps> = ({
  vitals,
  medications,
  ring,
  lastExecution,
  isProcessing,
  onQuickAction
}) => {
  const isEmergency = vitals.fallDetected || vitals.heartRate > 130;
  const missedMed = medications.find(m => m.status === 'missed');

  return (
    <div className="relative rounded-3xl border-4 border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col min-h-[580px]">
      {/* Echo Show Bezel Header */}
      <div className="bg-slate-950/90 px-6 py-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Echo Show 15 · Eleanor's Wall Display</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-sky-400" /> {vitals.currentRoom}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Main Display Body */}
      <div className="p-6 flex-1 flex flex-col justify-between relative bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
        
        {/* TOP STATUS BAR: Ambient Vitals Pill */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* Heart Rate */}
          <div className={`p-3 rounded-2xl border transition-all ${
            vitals.heartRate > 120 
              ? 'bg-red-950/40 border-red-700/80 text-red-200' 
              : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Heart Rate</span>
              <Heart className={`w-4 h-4 ${vitals.heartRate > 120 ? 'text-red-400 animate-pulse' : 'text-rose-400'}`} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight">{vitals.heartRate}</span>
              <span className="text-xs text-slate-400">BPM</span>
            </div>
            {vitals.heartRate > 120 && (
              <span className="text-[10px] text-red-400 font-semibold tracking-wide uppercase">Tachycardia Alert</span>
            )}
          </div>

          {/* Blood Oxygen */}
          <div className={`p-3 rounded-2xl border transition-all ${
            vitals.spO2 < 93 
              ? 'bg-amber-950/40 border-amber-700/80 text-amber-200' 
              : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>SpO2 Blood O2</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight">{vitals.spO2}%</span>
              <span className="text-xs text-slate-400">Normal</span>
            </div>
            <span className="text-[10px] text-emerald-400">Sensor Synced</span>
          </div>

          {/* Posture / Orientation */}
          <div className={`p-3 rounded-2xl border transition-all ${
            vitals.fallDetected 
              ? 'bg-red-950/50 border-red-600 text-red-200' 
              : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Body Posture</span>
              {vitals.fallDetected ? <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="text-sm font-semibold truncate capitalize">
              {vitals.fallDetected ? 'Fallen on Floor' : vitals.bodyOrientation.replace('_', ' ')}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {vitals.fallDetected ? `${vitals.impactGForce}G Impact` : `${vitals.lastMovementSecondsAgo}s ago active`}
            </span>
          </div>

          {/* Ring Smart Deadbolt */}
          <div className={`p-3 rounded-2xl border transition-all ${
            ring.doorLockState === 'unlocked'
              ? 'bg-amber-950/40 border-amber-600 text-amber-200'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Ring Perimeter</span>
              {ring.doorLockState === 'unlocked' ? <KeyRound className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-sky-400" />}
            </div>
            <div className="text-sm font-bold tracking-tight uppercase flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${ring.doorLockState === 'unlocked' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
              {ring.doorLockState}
            </div>
            <span className="text-[10px] text-slate-400">
              {ring.temporaryAccessCode ? `Code: ${ring.temporaryAccessCode}` : 'Auto-lock armed'}
            </span>
          </div>
        </div>

        {/* MIDDLE STAGE: Active Dynamic Card based on Context */}
        <div className="flex-1 flex flex-col justify-center my-2">
          {/* Emergency Fall State */}
          {vitals.fallDetected ? (
            <div className="bg-red-950/60 border-2 border-red-600 rounded-3xl p-6 glow-red animate-pulse-fast">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-red-100 uppercase tracking-wide">
                    Emergency Triage Active
                  </h3>
                  <p className="text-xs text-red-300">
                    High impact fall registered in {vitals.currentRoom} · Automated Alexa+ MCP Protocol triggered
                  </p>
                </div>
              </div>

              {/* Speech Callout */}
              <div className="bg-red-900/40 border border-red-700/60 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-red-300 mb-1">
                  <Mic className="w-3.5 h-3.5 text-red-400" /> Alexa+ Voice Speaking to Eleanor:
                </div>
                <p className="text-sm text-red-100 italic leading-relaxed">
                  "{lastExecution?.speechOutput || 'Eleanor, I detected a fall and noticed your heart rate is elevated. Please stay still. I have unlocked the front door and notified your daughter Sarah.'}"
                </p>
              </div>

              {/* Action Staging Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-red-800/60 text-red-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Daughter Sarah Vance Notified</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-red-800/60 text-red-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Ring Deadbolt Unlocked</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-red-800/60 text-red-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Paramedics SBAR Dispatched</span>
                </div>
              </div>
            </div>
          ) : missedMed ? (
            /* Missed Medication Card */
            <div className="bg-amber-950/40 border-2 border-amber-600/80 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-500 flex items-center justify-center">
                  <Pill className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-100">
                    Medication Reminder
                  </h3>
                  <p className="text-xs text-amber-300">
                    Scheduled dose overdue · Dispenser Slot {missedMed.dispenserSlot}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-amber-800/40 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-100">{missedMed.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700">
                    {missedMed.dosage}
                  </span>
                </div>
                <p className="text-xs text-amber-400 mb-3">{missedMed.warningIfMissed}</p>

                <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <Mic className="w-3.5 h-3.5 text-sky-400" />
                  <span>"{lastExecution?.speechOutput || 'Eleanor, your evening Eliquis is ready in slot 3.'}"</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onQuickAction("I just took my Eliquis medication now")}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md"
                >
                  Confirm Dose Taken
                </button>
                <button
                  onClick={() => onQuickAction("Remind me again in 15 minutes")}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700"
                >
                  Snooze 15 min
                </button>
              </div>
            </div>
          ) : ring.visitorType === 'first_responder' ? (
            /* Ring First Responder Live Feed */
            <div className="bg-sky-950/40 border-2 border-sky-600/80 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-600/30 border border-sky-500 flex items-center justify-center">
                    <Video className="w-7 h-7 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-sky-100 flex items-center gap-2">
                      Ring Video Doorbell Pro <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-normal">LIVE</span>
                    </h3>
                    <p className="text-xs text-sky-300">
                      Paramedic / First Responder Unit verified at Front Porch
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-emerald-400 font-bold block">DOOR UNLOCKED</span>
                  <span className="text-[10px] text-slate-400 font-mono">CODE: {ring.temporaryAccessCode || '911-EMT'}</span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-48 mb-4">
                <img
                  src={ring.cameraSnapshotUrl}
                  alt="Ring Camera Feed"
                  className="w-full h-48 object-cover brightness-90 contrast-110"
                />
                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> REC · Front Porch Cam
                </div>
                <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-xs text-sky-300 border border-sky-500/30">
                  🎙️ Ring Intercom Broadcast: "Door unlocked. Eleanor is in the hallway. PulseGuard EHR ready on screen."
                </div>
              </div>
            </div>
          ) : (
            /* Peaceful Ambient Eleanor Home Screen */
            <div className="text-center py-8 px-4">
              <div className="w-20 h-20 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-4 glow-blue">
                <ShieldCheck className="w-10 h-10 text-sky-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                All Systems Normal & Secure
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                Alexa+ ambient monitor is actively tracking vitals, motion telemetry, medication schedules, and Ring perimeter locks.
              </p>

              {lastExecution?.speechOutput && (
                <div className="max-w-lg mx-auto bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 text-xs text-slate-300 italic">
                  <span className="text-sky-400 font-semibold not-italic block mb-1">Alexa+ Ambient Response:</span>
                  "{lastExecution.speechOutput}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM: Alexa Interactive Voice Light Bar */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className={`w-3.5 h-3.5 rounded-full ${
                isEmergency ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-sky-400 shadow-lg shadow-sky-400/50'
              } ${isProcessing ? 'animate-ping' : ''}`}></div>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {isProcessing ? 'Alexa+ Agent Reasoning via MCP...' : 'Alexa+ Listening in Eleanor\'s Home'}
            </span>
          </div>

          {/* Simulated Waveform Visualizer */}
          <div className="flex items-center gap-1 h-5">
            {[40, 75, 100, 60, 90, 45, 80, 60].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isEmergency ? 'bg-red-500' : 'bg-sky-400'
                } ${isProcessing ? 'animate-wave' : 'opacity-40'}`}
                style={{ height: `${isProcessing ? h : 30}%` }}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
