import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { EchoShowDisplay } from './components/EchoShowDisplay.tsx';
import { AgentInspector } from './components/AgentInspector.tsx';
import { ScenarioController } from './components/ScenarioController.tsx';
import { CareLedger } from './components/CareLedger.tsx';
import { McpSchemaViewer } from './components/McpSchemaViewer.tsx';
import { PatientVitals, MedicationItem, RingSecurityState, CareAuditEntry, AgentExecutionResult } from './types.ts';

export default function App() {
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

  // Speech synthesis for Alexa's voice
  const speakAlexaVoice = useCallback((text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 1.05; // slightly melodic/calm tone

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

  // Fetch initial state
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
      console.warn('Backend connection pending...');
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Trigger Scenario handler
  const handleTriggerScenario = async (scenarioId: 'fall_emergency' | 'missed_meds' | 'first_responder_arrival' | 'reset_normal') => {
    setIsProcessing(true);
    setActiveScenario(scenarioId);

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
      console.error('Failed to trigger scenario:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Custom User / Voice Prompt handler
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
      console.error('Failed to process custom prompt:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        onSendCustomPrompt={handleCustomPrompt}
        onReset={() => handleTriggerScenario('reset_normal')}
        isProcessing={isProcessing}
        status={lastExecution?.status || 'monitoring'}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TOP ROW: Echo Show Display (Left) + Agent Reasoning & MCP Inspector (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <EchoShowDisplay
              vitals={vitals}
              medications={medications}
              ring={ring}
              lastExecution={lastExecution}
              isProcessing={isProcessing}
              onQuickAction={handleCustomPrompt}
            />
          </div>

          <div className="lg:col-span-5">
            <AgentInspector
              execution={lastExecution}
              isProcessing={isProcessing}
            />
          </div>
        </div>

        {/* BOTTOM ROW: Scenario Controller + Care Ledger + MCP Tools */}
        <div className="space-y-6">
          <ScenarioController
            onTrigger={handleTriggerScenario}
            isProcessing={isProcessing}
            activeScenario={activeScenario}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CareLedger logs={auditLogs} />
            <McpSchemaViewer />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        PulseGuard MCP · Built for Amazon Developer Hackathon 2026: Build, Ship, Shape · Licensed under MIT
      </footer>
    </div>
  );
}
