import React, { useState, useEffect, useCallback } from 'react';
import { Header, ViewMode } from './components/Header.tsx';
import { DemoToolbar } from './components/DemoToolbar.tsx';
import { EchoShowDisplay } from './components/EchoShowDisplay.tsx';
import { AgentInspector } from './components/AgentInspector.tsx';
import { CareLedger } from './components/CareLedger.tsx';
import { McpSchemaViewer } from './components/McpSchemaViewer.tsx';
import { CaregiverPortal } from './components/CaregiverPortal.tsx';
import { DeveloperHub } from './components/DeveloperHub.tsx';
import { playAlexaChime } from './utils/audio.ts';
import { PatientVitals, MedicationItem, RingSecurityState, CareAuditEntry, AgentExecutionResult, SnoozeTimerState } from './types.ts';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [snoozeTimer, setSnoozeTimer] = useState<SnoozeTimerState | null>(null);
  const [vitals, setVitals] = useState<PatientVitals>({
    patientId: 'PT-8821',
    name: 'Eleanor Vance',
    age: 78,
    heartRate: 72,
    spO2: 98,
    systolicBP: 124,
    diastolicBP: 82,
    fallDetected: false,
    impactGForce: 1.02,
    bodyOrientation: 'standing',
    lastMovementSecondsAgo: 8,
    currentRoom: 'Living Room',
    timestamp: new Date().toISOString()
  });

  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [ring, setRing] = useState<RingSecurityState>({
    doorbellState: 'idle',
    doorLockState: 'locked',
    visitorType: 'none',
    cameraSnapshotUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&auto=format&fit=crop&q=80',
    intercomActive: false
  });

  const [auditLogs, setAuditLogs] = useState<CareAuditEntry[]>([]);
  const [lastExecution, setLastExecution] = useState<AgentExecutionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [activeScenario, setActiveScenario] = useState<string>('reset_normal');

  // Synthesized Alexa voice
  const speakAlexaVoice = useCallback((text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => 
        v.name.includes('Samantha') || 
        v.name.includes('Google UK English Female') || 
        v.name.includes('Zira') || 
        v.name.includes('Natural') ||
        (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
      );
      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  }, [voiceEnabled]);

  // Initial fetch
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setVitals(data.vitals);
        setMedications(data.medications);
        setRing(data.ring);
        setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.warn('Backend connecting...');
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Trigger Scenario
  const handleTriggerScenario = async (scenarioId: 'fall_emergency' | 'missed_meds' | 'first_responder_arrival' | 'reset_normal') => {
    setIsProcessing(true);
    setActiveScenario(scenarioId);

    // Audio chime feedback
    if (scenarioId === 'fall_emergency') {
      playAlexaChime('alert');
    } else {
      playAlexaChime('wake');
    }

    try {
      const res = await fetch('/api/trigger-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId })
      });

      if (res.ok) {
        const data = await res.json();
        setVitals(data.currentState.vitals);
        setMedications(data.currentState.medications);
        setRing(data.currentState.ring);
        setAuditLogs(data.currentState.auditLogs);

        if (data.agentExecution) {
          setLastExecution(data.agentExecution);
          if (data.agentExecution.speechOutput) {
            speakAlexaVoice(data.agentExecution.speechOutput);
          }
        }
      }
    } catch (err) {
      console.error('Scenario trigger error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Custom User Prompt
  const handleCustomPrompt = async (prompt: string) => {
    setIsProcessing(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (res.ok) {
        const data = await res.json();
        setVitals(data.currentState.vitals);
        setMedications(data.currentState.medications);
        setRing(data.currentState.ring);
        setAuditLogs(data.currentState.auditLogs);

        if (data.executionResult) {
          setLastExecution(data.executionResult);
          if (data.executionResult.speechOutput) {
            speakAlexaVoice(data.executionResult.speechOutput);
          }
        }
      }
    } catch (err) {
      console.error('Prompt processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Background 1-second interval for Active Snooze Timer
  useEffect(() => {
    let interval: any = null;
    if (snoozeTimer && snoozeTimer.active) {
      interval = setInterval(() => {
        setSnoozeTimer(prev => {
          if (!prev || !prev.active) return null;
          if (prev.remainingSeconds <= 1) {
            handleSnoozeExpire();
            return null;
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [snoozeTimer?.active]);

  const handleSnoozeExpire = async () => {
    playAlexaChime('alert');
    // Set Eliquis back to missed so alert card re-opens automatically!
    setMedications(prev => prev.map(m => m.id === 'med-3' ? { ...m, status: 'missed' } : m));
    setVitals(prev => ({ ...prev, systolicBP: 148, diastolicBP: 94 }));

    const reAlertSpeech = "Eleanor, your 15-minute snooze has ended. A quick reminder: Your evening Eliquis anticoagulant in dispenser slot 3 is still pending. Please take it now with a glass of water.";
    setLastExecution({
      speechOutput: reAlertSpeech,
      steps: [
        {
          step: 1,
          timestamp: new Date().toISOString(),
          thought: '⏰ Snooze timer expired: Dispenser slot 3 remains unverified. Re-alerting Eleanor via audio and visual prompt on Echo Show 15.',
          speechOutput: reAlertSpeech
        }
      ],
      status: 'resolved',
      usedLiveBedrock: false
    });
    speakAlexaVoice(reAlertSpeech);
  };

  const handleFastForwardSnooze = () => {
    if (!snoozeTimer) return;
    setSnoozeTimer(prev => prev ? { ...prev, remainingSeconds: 3 } : null);
  };

  // Medication Direct Actions
  const handleConfirmMedication = async (medId: string = 'med-3') => {
    setIsProcessing(true);
    playAlexaChime('success');
    setSnoozeTimer(null); // Cancel any active snooze timer

    // Optimistic UI update immediately
    setMedications(prev => prev.map(m => m.id === medId ? { ...m, status: 'taken' } : m));
    setVitals(prev => ({ ...prev, systolicBP: 122, diastolicBP: 80, heartRate: 74 }));

    try {
      const res = await fetch('/api/medications/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicationId: medId })
      });
      if (res.ok) {
        const data = await res.json();
        setVitals(data.currentState.vitals);
        setMedications(data.currentState.medications);
        setRing(data.currentState.ring);
        setAuditLogs(data.currentState.auditLogs);
        if (data.agentExecution) {
          setLastExecution(data.agentExecution);
          if (data.agentExecution.speechOutput) {
            speakAlexaVoice(data.agentExecution.speechOutput);
          }
        }
      }
    } catch (err) {
      console.error('Failed to confirm dose:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSnoozeMedication = async (medId: string = 'med-3') => {
    setIsProcessing(true);
    playAlexaChime('wake');

    // Optimistic UI update immediately
    setMedications(prev => prev.map(m => m.id === medId ? { ...m, status: 'pending' } : m));

    // Arm the real 15-minute (900 seconds) snooze timer
    setSnoozeTimer({
      active: true,
      remainingSeconds: 15 * 60,
      medicationName: 'Eliquis (Apixaban)',
      dispenserSlot: 3
    });

    try {
      const res = await fetch('/api/medications/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicationId: medId })
      });
      if (res.ok) {
        const data = await res.json();
        setVitals(data.currentState.vitals);
        setMedications(data.currentState.medications);
        setRing(data.currentState.ring);
        setAuditLogs(data.currentState.auditLogs);
        if (data.agentExecution) {
          setLastExecution(data.agentExecution);
          if (data.agentExecution.speechOutput) {
            speakAlexaVoice(data.agentExecution.speechOutput);
          }
        }
      }
    } catch (err) {
      console.error('Failed to snooze dose:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Emergency Interactive Handlers (Scenario 1)
  const handleCancelFalseAlarm = async () => {
    setIsProcessing(true);
    playAlexaChime('success');

    // Optimistic UI reset
    setVitals(prev => ({
      ...prev,
      fallDetected: false,
      bodyOrientation: 'sitting',
      heartRate: 78,
      systolicBP: 126,
      diastolicBP: 82
    }));
    setRing(prev => ({ ...prev, doorLockState: 'locked' }));

    try {
      const res = await fetch('/api/emergency/cancel-false-alarm', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setVitals(data.currentState.vitals);
        setMedications(data.currentState.medications);
        setRing(data.currentState.ring);
        setAuditLogs(data.currentState.auditLogs);
        if (data.agentExecution) {
          setLastExecution(data.agentExecution);
          if (data.agentExecution.speechOutput) {
            speakAlexaVoice(data.agentExecution.speechOutput);
          }
        }
      }
    } catch (err) {
      console.error('Cancel false alarm error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDispatchAmbulanceNow = async () => {
    setIsProcessing(true);
    playAlexaChime('alert');

    try {
      const res = await fetch('/api/emergency/dispatch-now', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setVitals(data.currentState.vitals);
        setMedications(data.currentState.medications);
        setRing(data.currentState.ring);
        setAuditLogs(data.currentState.auditLogs);
        if (data.agentExecution) {
          setLastExecution(data.agentExecution);
          if (data.agentExecution.speechOutput) {
            speakAlexaVoice(data.agentExecution.speechOutput);
          }
        }
      }
    } catch (err) {
      console.error('Dispatch ambulance error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDropInCall = async () => {
    setIsProcessing(true);
    playAlexaChime('wake');

    try {
      const res = await fetch('/api/emergency/drop-in', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setVitals(data.currentState.vitals);
        setMedications(data.currentState.medications);
        setRing(data.currentState.ring);
        setAuditLogs(data.currentState.auditLogs);
        if (data.agentExecution) {
          setLastExecution(data.agentExecution);
          if (data.agentExecution.speechOutput) {
            speakAlexaVoice(data.agentExecution.speechOutput);
          }
        }
      }
    } catch (err) {
      console.error('Drop-In call error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Remote Ring deadbolt toggle
  const handleToggleLock = async () => {
    try {
      const res = await fetch('/api/ring/toggle-lock', { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setRing(updated);
      }
    } catch (err) {
      console.error('Lock toggle error:', err);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 selection:bg-sky-500/20 selection:text-sky-900">
      {/* Subtle ambient glass background glows */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-300/20 blur-3xl"></div>
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-[30rem] h-[30rem] rounded-full bg-blue-200/25 blur-3xl"></div>
      </div>

      {/* Top Navigation Bar with View Switcher */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        onSendCustomPrompt={handleCustomPrompt}
        onReset={() => handleTriggerScenario('reset_normal')}
        isProcessing={isProcessing}
        status={lastExecution?.status || 'monitoring'}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Scenario Control Toolbar - Always Visible & One-Click Accessible */}
        <DemoToolbar
          onTrigger={handleTriggerScenario}
          isProcessing={isProcessing}
          activeScenario={activeScenario}
        />

        {/* VIEW 1: SPLIT EXECUTIVE VIEW (Recommended for Demo Video & Judges) */}
        {viewMode === 'split' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Echo Show 15 Display (7 cols) */}
              <div className="lg:col-span-7">
                <EchoShowDisplay
                  vitals={vitals}
                  medications={medications}
                  ring={ring}
                  lastExecution={lastExecution}
                  isProcessing={isProcessing}
                  onQuickAction={handleCustomPrompt}
                  onConfirmMedication={handleConfirmMedication}
                  onSnoozeMedication={handleSnoozeMedication}
                  onCancelFalseAlarm={handleCancelFalseAlarm}
                  onDispatchAmbulanceNow={handleDispatchAmbulanceNow}
                  onDropInCall={handleDropInCall}
                  snoozeState={snoozeTimer}
                  onFastForwardSnooze={handleFastForwardSnooze}
                />
              </div>

              {/* Agent Reasoning & MCP Tool Inspector (5 cols) */}
              <div className="lg:col-span-5">
                <AgentInspector
                  execution={lastExecution}
                  isProcessing={isProcessing}
                />
              </div>
            </div>

            {/* Bottom Row: Care Ledger + MCP Tool Schemas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CareLedger logs={auditLogs} />
              <McpSchemaViewer />
            </div>
          </div>
        )}

        {/* VIEW 2: ECHO SHOW 15 ONLY (Patient Ambient View) */}
        {viewMode === 'echoshow' && (
          <div className="max-w-4xl mx-auto py-2">
            <EchoShowDisplay
              vitals={vitals}
              medications={medications}
              ring={ring}
              lastExecution={lastExecution}
              isProcessing={isProcessing}
              onQuickAction={handleCustomPrompt}
              onConfirmMedication={handleConfirmMedication}
              onSnoozeMedication={handleSnoozeMedication}
              onCancelFalseAlarm={handleCancelFalseAlarm}
              onDispatchAmbulanceNow={handleDispatchAmbulanceNow}
              onDropInCall={handleDropInCall}
              snoozeState={snoozeTimer}
              onFastForwardSnooze={handleFastForwardSnooze}
            />
          </div>
        )}

        {/* VIEW 3: CAREGIVER MOBILE PORTAL (Daughter Sarah Vance's View) */}
        {viewMode === 'caregiver' && (
          <CaregiverPortal
            vitals={vitals}
            medications={medications}
            ring={ring}
            auditLogs={auditLogs}
            onToggleLock={handleToggleLock}
            onCallHelp={() => handleCustomPrompt("Daughter Sarah Vance calling Echo Show in living room")}
          />
        )}

        {/* VIEW 4: DEVELOPER & MCP ARCHITECTURE HUB */}
        {viewMode === 'developer' && (
          <DeveloperHub
            auditLogs={auditLogs}
            lastExecution={lastExecution}
            isProcessing={isProcessing}
          />
        )}
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-white/80 bg-white/60 backdrop-blur-md py-4 px-6 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full mt-4">
        <div>
          <span className="text-slate-800 font-semibold">PulseGuard MCP</span> · Amazon Developer Hackathon 2026: Build, Ship, Shape
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-600">
          <span>Model Context Protocol v1.0</span>
          <span>•</span>
          <span>Amazon Bedrock Nova</span>
          <span>•</span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  );
}
