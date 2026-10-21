import React from 'react';
import { 
  Smartphone, User, Heart, Shield, Lock, Unlock, PhoneCall, 
  Clock, CheckCircle2, AlertTriangle, Pill, Calendar, MessageSquare, ChevronRight
} from 'lucide-react';
import { PatientVitals, MedicationItem, RingSecurityState, CareAuditEntry } from '../types.ts';

interface CaregiverPortalProps {
  vitals: PatientVitals;
  medications: MedicationItem[];
  ring: RingSecurityState;
  auditLogs: CareAuditEntry[];
  onToggleLock: () => void;
  onCallHelp: () => void;
}

export const CaregiverPortal: React.FC<CaregiverPortalProps> = ({
  vitals,
  medications,
  ring,
  auditLogs,
  onToggleLock,
  onCallHelp
}) => {
  const isEmergency = vitals.fallDetected || vitals.heartRate > 120;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mobile-style Caregiver App Frame Banner */}
      <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2.5">
                Caregiver Mobile Portal 
                <span className="bg-cyan-950/70 border border-cyan-800/80 text-cyan-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
                  Sarah Vance
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Remote Monitoring Eleanor Vance (Mother, 78) · Seattle Residence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onToggleLock}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                ring.doorLockState === 'unlocked'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-500/50'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              {ring.doorLockState === 'unlocked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{ring.doorLockState === 'unlocked' ? 'Door Unlocked (Relock)' : 'Unlock Ring Deadbolt'}</span>
            </button>

            <button
              onClick={onCallHelp}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-900/40 transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Eleanor's Echo</span>
            </button>
          </div>
        </div>

        {/* Current Safety Status Card */}
        <div className={`p-4 rounded-xl border transition-all mb-6 shadow-sm ${
          isEmergency 
            ? 'bg-red-950/40 border-red-700/80 text-red-100 shadow-red-950/30' 
            : 'bg-slate-950/60 border-slate-800/80 text-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                isEmergency 
                  ? 'bg-red-900/50 border border-red-600/70 text-red-300' 
                  : 'bg-emerald-950/50 border border-emerald-700/60 text-emerald-400'
              }`}>
                {isEmergency ? <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">Live Status</span>
                <p className="text-sm font-bold text-slate-100">
                  {isEmergency ? '🚨 CRITICAL MEDICAL ALERT IN PROGRESS' : 'Stable · Active in Living Room'}
                </p>
              </div>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-slate-400 block text-[11px]">Telemetry Synced</span>
              <span className="text-cyan-400 font-semibold">Echo Show 15 Online</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 shadow-sm">
            <span className="text-xs text-slate-400 font-medium">Resting Heart Rate</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold font-mono text-slate-100">{vitals.heartRate}</span>
              <span className="text-xs text-slate-400 font-mono">BPM</span>
              <Heart className={`w-4 h-4 ml-auto ${vitals.heartRate > 120 ? 'text-red-400 animate-pulse' : 'text-rose-400'}`} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 shadow-sm">
            <span className="text-xs text-slate-400 font-medium">Medication Compliance</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold font-mono text-slate-100">
                {medications.filter(m => m.status === 'taken').length} / {medications.length}
              </span>
              <span className="text-xs text-emerald-400 font-semibold font-mono">Today</span>
              <Pill className="w-4 h-4 text-amber-400 ml-auto" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 shadow-sm">
            <span className="text-xs text-slate-400 font-medium">Ring Perimeter Status</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-base font-bold font-mono text-slate-100 uppercase">{ring.doorLockState}</span>
              <span className="text-xs text-slate-400 font-mono">Deadbolt</span>
              <Shield className="w-4 h-4 text-cyan-400 ml-auto" />
            </div>
          </div>
        </div>

        {/* Caregiver Emergency Direct Contacts */}
        <div className="border-t border-slate-800/80 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Registered Emergency Escalation Tree
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between shadow-sm">
              <div>
                <span className="font-semibold text-slate-200 block">Sarah Vance (Daughter)</span>
                <span className="text-[11px] text-slate-400 font-mono">(555) 321-9876 · Primary</span>
              </div>
              <span className="bg-cyan-950/60 border border-cyan-800/70 text-cyan-400 text-[10px] px-2.5 py-1 rounded-lg font-mono font-medium">
                SMS Armed
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between shadow-sm">
              <div>
                <span className="font-semibold text-slate-200 block">Dr. Robert Chen</span>
                <span className="text-[11px] text-slate-400 font-mono">Cardiology Clinic</span>
              </div>
              <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] px-2.5 py-1 rounded-lg font-mono">
                EHR Synced
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between shadow-sm">
              <div>
                <span className="font-semibold text-slate-200 block">King County EMS (911)</span>
                <span className="text-[11px] text-slate-400 font-mono">Auto-Dispatch Staged</span>
              </div>
              <span className="bg-red-950/60 border border-red-800/70 text-red-400 text-[10px] px-2.5 py-1 rounded-lg font-mono font-medium">
                Code 911-EMT
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};