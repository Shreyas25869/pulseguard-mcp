import React from 'react';
import { 
  Heart, Activity, Pill, ShieldCheck, ShieldAlert, KeyRound, 
  Video, Mic, AlertTriangle, Clock, MapPin, CheckCircle2, UserCheck,
  CloudSun, Bell, Volume2, Shield
} from 'lucide-react';
import { PatientVitals, MedicationItem, RingSecurityState, AgentExecutionResult } from '../types.ts';
import { ECGWaveform } from './ECGWaveform.tsx';

interface EchoShowDisplayProps {
  vitals: PatientVitals;
  medications: MedicationItem[];
  ring: RingSecurityState;
  lastExecution: AgentExecutionResult | null;
  isProcessing: boolean;
  onQuickAction: (actionPrompt: string) => void;
  onConfirmMedication?: (medId: string) => void;
  onSnoozeMedication?: (medId: string) => void;
}

export const EchoShowDisplay: React.FC<EchoShowDisplayProps> = ({
  vitals,
  medications,
  ring,
  lastExecution,
  isProcessing,
  onQuickAction,
  onConfirmMedication,
  onSnoozeMedication
}) => {
  const isEmergency = vitals.fallDetected || vitals.heartRate > 130;
  const missedMed = medications.find(m => m.status === 'missed');

  return (
    <div className="relative rounded-[2.2rem] p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl border border-slate-700/60 transition-all">
      {/* Echo Show Bezel Frame */}
      <div className="rounded-[1.8rem] bg-slate-950 overflow-hidden border border-slate-900 shadow-inner flex flex-col min-h-[560px]">
        
        {/* Device Top Bar: Camera notch, Time, Status */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Camera lens hole */}
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-sky-500/80"></span>
            </div>
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
              Echo Show 15 · Wall Display
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" /> 71°F Seattle
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-sky-400" /> {vitals.currentRoom}
            </span>
            <span className="flex items-center gap-1 text-slate-200 font-bold">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> 
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Display Canvas */}
        <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 relative">
          
          {/* TOP SECTION: Patient Vitals & Live Cardiac Telemetry */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
            {/* Heart Rate + Live ECG */}
            <div className={`p-3 rounded-2xl border transition-all ${
              vitals.heartRate > 120 
                ? 'bg-red-950/40 border-red-700/80 text-red-200' 
                : 'bg-slate-900/80 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-medium">Heart Rate</span>
                <Heart className={`w-3.5 h-3.5 ${vitals.heartRate > 120 ? 'text-red-400 animate-pulse' : 'text-rose-400'}`} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight">{vitals.heartRate}</span>
                <span className="text-[11px] text-slate-400">BPM</span>
              </div>
              {/* Animated Live ECG Rhythm */}
              <ECGWaveform heartRate={vitals.heartRate} isEmergency={vitals.heartRate > 120} />
            </div>

            {/* Blood Oxygen SpO2 */}
            <div className="p-3 rounded-2xl border bg-slate-900/80 border-slate-800 text-slate-200">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-medium">Blood Oxygen</span>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight">{vitals.spO2}%</span>
                <span className="text-[11px] text-emerald-400">Optimal</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-2">
                BP: {vitals.systolicBP}/{vitals.diastolicBP} mmHg
              </p>
            </div>

            {/* Posture & Motion */}
            <div className={`p-3 rounded-2xl border transition-all ${
              vitals.fallDetected 
                ? 'bg-red-950/50 border-red-600 text-red-200' 
                : 'bg-slate-900/80 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-medium">Body Posture</span>
                {vitals.fallDetected ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="text-xs font-bold truncate capitalize mt-0.5">
                {vitals.fallDetected ? '🚨 Fall on Floor' : vitals.bodyOrientation.replace('_', ' ')}
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-2">
                {vitals.fallDetected ? `${vitals.impactGForce}G Impact registered` : `${vitals.lastMovementSecondsAgo}s active in ${vitals.currentRoom}`}
              </p>
            </div>

            {/* Ring Smart Deadbolt */}
            <div className={`p-3 rounded-2xl border transition-all ${
              ring.doorLockState === 'unlocked'
                ? 'bg-amber-950/40 border-amber-600 text-amber-200'
                : 'bg-slate-900/80 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-medium">Ring Perimeter</span>
                {ring.doorLockState === 'unlocked' ? (
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                )}
              </div>
              <div className="text-xs font-bold tracking-tight uppercase flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${ring.doorLockState === 'unlocked' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
                {ring.doorLockState}
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-2 truncate">
                {ring.temporaryAccessCode ? `Code: ${ring.temporaryAccessCode}` : 'Perimeter Secured'}
              </p>
            </div>
          </div>

          {/* CENTER STAGE: Contextual Card (Emergency / Missed Meds / Paramedics / Ambient) */}
          <div className="flex-1 flex flex-col justify-center my-1">
            {vitals.fallDetected ? (
              /* EMERGENCY FALL CARD */
              <div className="bg-red-950/70 border-2 border-red-600 rounded-3xl p-5 shadow-2xl glow-red animate-pulse-fast">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center">
                      <ShieldAlert className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-red-100 uppercase tracking-wide">
                        Emergency Triage Protocol Active
                      </h3>
                      <p className="text-xs text-red-300">
                        High impact fall detected in {vitals.currentRoom} · Autonomous Alexa+ MCP triage executed
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-red-900/60 border border-red-600 text-red-200 font-bold">
                    PRIORITY 1
                  </span>
                </div>

                {/* Spoken voice callout */}
                <div className="bg-slate-950/80 border border-red-700/60 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-300 mb-1.5">
                    <Mic className="w-3.5 h-3.5 text-red-400" /> Alexa+ Voice Speaking to Eleanor:
                  </div>
                  <p className="text-sm text-red-100 italic leading-relaxed">
                    "{lastExecution?.speechOutput || 'Eleanor, I detected a hard fall and noticed your heart rate is rapid. Please remain still. I have unlocked the front door for emergency assistance and alerted your daughter Sarah.'}"
                  </p>
                </div>

                {/* Action summary checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-red-800/60 text-red-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">Sarah Vance Notified (SMS)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-red-800/60 text-red-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">Ring Deadbolt Unlocked (Code: 911-EMT)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-red-800/60 text-red-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">SBAR Triage Ledger Committed</span>
                  </div>
                </div>
              </div>
            ) : missedMed ? (
              /* MISSED MEDICATION CARD */
              <div className="bg-amber-950/50 border-2 border-amber-600/80 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-600/30 border border-amber-500 flex items-center justify-center">
                      <Pill className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-100">
                        Medication Adherence Alert
                      </h3>
                      <p className="text-xs text-amber-300">
                        Prescription overdue by 140 minutes · Smart Dispenser Slot {missedMed.dispenserSlot}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-900/60 border border-amber-600 text-amber-300">
                    Slot {missedMed.dispenserSlot} Alert
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-amber-800/60 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-100 text-sm">{missedMed.name}</span>
                    <span className="text-xs font-mono text-amber-400">{missedMed.dosage}</span>
                  </div>
                  <p className="text-xs text-amber-300 mb-3">{missedMed.warningIfMissed}</p>

                  <div className="text-xs text-slate-200 bg-slate-900 p-2.5 rounded-xl border border-slate-800 italic flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span>"{lastExecution?.speechOutput || 'Eleanor, your evening Eliquis anticoagulant is ready in slot 3.'}"</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      if (onConfirmMedication) {
                        onConfirmMedication(missedMed.id);
                      } else {
                        onQuickAction("I just took my Eliquis medication now");
                      }
                    }}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Dose Taken</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onSnoozeMedication) {
                        onSnoozeMedication(missedMed.id);
                      } else {
                        onQuickAction("Remind me again in 15 minutes");
                      }
                    }}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Snooze 15 min
                  </button>
                </div>
              </div>
            ) : lastExecution?.speechOutput?.includes("Eliquis dose as taken") ? (
              /* DOSE CONFIRMED SUCCESS CARD */
              <div className="bg-emerald-950/40 border-2 border-emerald-600/80 rounded-3xl p-5 shadow-xl text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-emerald-100 mb-1">
                  Eliquis Dose Confirmed & Verified
                </h3>
                <p className="text-xs text-emerald-300 mb-3 font-mono">
                  Dispenser Slot 3 cleared · Daily Adherence 100% · Telemetry Restored
                </p>
                <div className="max-w-md mx-auto bg-slate-950/80 border border-emerald-800/60 rounded-2xl p-3 text-xs text-slate-200 italic">
                  "{lastExecution.speechOutput}"
                </div>
              </div>
            ) : ring.visitorType === 'first_responder' ? (
              /* RING FIRST RESPONDER ARRIVAL */
              <div className="bg-sky-950/50 border-2 border-sky-600/80 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-600/30 border border-sky-500 flex items-center justify-center">
                      <Video className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-sky-100 flex items-center gap-2">
                        Ring Video Doorbell Pro <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-normal">LIVE</span>
                      </h3>
                      <p className="text-xs text-sky-300">
                        First Responders verified at front door
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-emerald-400 font-bold block">DEADBOLT UNLOCKED</span>
                    <span className="text-[10px] text-slate-400 font-mono">CODE: {ring.temporaryAccessCode || '911-EMT'}</span>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-48 mb-3">
                  <img
                    src={ring.cameraSnapshotUrl}
                    alt="Ring Front Porch Feed"
                    className="w-full h-44 object-cover brightness-95"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Porch Cam HD
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-xs text-sky-300 border border-sky-500/30">
                    🎙️ Ring Intercom: "Door unlocked. Eleanor is in the hallway. PulseGuard EHR ready on screen."
                  </div>
                </div>
              </div>
            ) : (
              /* AMBIENT LIVING ROOM VIEW */
              <div className="text-center py-6 px-4">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-3 glow-blue">
                  <ShieldCheck className="w-8 h-8 text-sky-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1.5">
                  Eleanor Vance · Resting Comfortably
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  Alexa+ ambient guard is actively correlating wearable vitals, motion sensors, and Ring perimeter deadbolts.
                </p>

                {lastExecution?.speechOutput && (
                  <div className="max-w-md mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300 italic">
                    <span className="text-sky-400 font-semibold not-italic block mb-0.5">Alexa+ Response:</span>
                    "{lastExecution.speechOutput}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BOTTOM ALEXA LIGHT BAR: Signature Echo Show LED Glow */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className={`w-3.5 h-3.5 rounded-full ${
                  isEmergency ? 'bg-red-500 shadow-lg shadow-red-500/80' : 'bg-sky-400 shadow-lg shadow-sky-400/80'
                } ${isProcessing ? 'animate-ping' : ''}`}></div>
              </div>
              <span className="text-xs font-mono text-slate-300">
                {isProcessing ? 'Alexa+ reasoning over Model Context Protocol...' : 'Alexa+ Active in Home'}
              </span>
            </div>

            {/* Signature Alexa Audio Waveform */}
            <div className="flex items-center gap-1 h-5">
              {[35, 70, 95, 55, 85, 45, 80, 60].map((h, i) => (
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
    </div>
  );
};
