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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Caregiver Mobile Portal <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-sky-700 font-mono font-semibold">Sarah Vance</span>
              </h2>
              <p className="text-xs text-slate-500">
                Remote Monitoring Eleanor Vance (Mother, 78) · Seattle Residence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLock}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                ring.doorLockState === 'unlocked'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {ring.doorLockState === 'unlocked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{ring.doorLockState === 'unlocked' ? 'Door Unlocked (Relock)' : 'Unlock Ring Deadbolt'}</span>
            </button>

            <button
              onClick={onCallHelp}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Eleanor's Echo</span>
            </button>
          </div>
        </div>

        {/* Current Safety Status Card */}
        <div className={`p-4 rounded-2xl border transition-all mb-6 shadow-xs ${
          isEmergency 
            ? 'bg-red-50 border-red-300 text-red-900' 
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isEmergency ? 'bg-red-100 border border-red-300 text-red-600' : 'bg-teal-50 border border-teal-200 text-teal-700'
              }`}>
                {isEmergency ? <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" /> : <CheckCircle2 className="w-5 h-5 text-teal-600" />}
              </div>
              <div>
                <span className="text-xs uppercase font-mono tracking-wider font-semibold opacity-70">Live Status</span>
                <p className="text-sm font-bold text-slate-900">
                  {isEmergency ? '🚨 CRITICAL MEDICAL ALERT IN PROGRESS' : 'Stable · Active in Living Room'}
                </p>
              </div>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-slate-500 block">Telemetry Synced</span>
              <span className="text-sky-700 font-semibold">Echo Show 15 Online</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500">Resting Heart Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-slate-900">{vitals.heartRate}</span>
              <span className="text-xs text-slate-500">BPM</span>
              <Heart className={`w-3.5 h-3.5 ml-auto ${vitals.heartRate > 120 ? 'text-red-500' : 'text-rose-500'}`} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500">Medication Compliance</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-slate-900">
                {medications.filter(m => m.status === 'taken').length} / {medications.length}
              </span>
              <span className="text-xs text-teal-700 font-semibold">Today</span>
              <Pill className="w-3.5 h-3.5 text-amber-500 ml-auto" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500">Ring Perimeter Status</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-base font-bold font-mono text-slate-900 uppercase">{ring.doorLockState}</span>
              <span className="text-xs text-slate-500">Deadbolt</span>
              <Shield className="w-3.5 h-3.5 text-sky-600 ml-auto" />
            </div>
          </div>
        </div>

        {/* Caregiver Emergency Direct Contacts */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Registered Emergency Escalation Tree
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs">
              <div>
                <span className="font-semibold text-slate-900 block">Sarah Vance (Daughter)</span>
                <span className="text-[11px] text-slate-500 font-mono">(555) 321-9876 · Primary</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 font-mono font-medium">SMS Armed</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs">
              <div>
                <span className="font-semibold text-slate-900 block">Dr. Robert Chen</span>
                <span className="text-[11px] text-slate-500 font-mono">Cardiology Clinic</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono">EHR Synced</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs">
              <div>
                <span className="font-semibold text-slate-900 block">King County EMS (911)</span>
                <span className="text-[11px] text-slate-500 font-mono">Auto-Dispatch Staged</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 font-mono font-medium">Code 911-EMT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
