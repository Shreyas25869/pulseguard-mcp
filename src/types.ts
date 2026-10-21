export interface PatientVitals {
  patientId: string;
  name: string;
  age: number;
  heartRate: number;
  spO2: number;
  systolicBP: number;
  diastolicBP: number;
  fallDetected: boolean;
  impactGForce: number;
  bodyOrientation: 'standing' | 'sitting' | 'lying_horizontal' | 'fallen_abnormal';
  lastMovementSecondsAgo: number;
  currentRoom: string;
  timestamp: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  status: 'taken' | 'pending' | 'missed' | 'dispensed_not_taken';
  dispenserSlot: number;
  warningIfMissed: string;
}

export interface RingSecurityState {
  doorbellState: 'idle' | 'motion_detected' | 'ring_active' | 'visitor_waiting';
  doorLockState: 'locked' | 'unlocked';
  visitorType: 'none' | 'caregiver' | 'first_responder' | 'delivery' | 'unknown';
  cameraSnapshotUrl: string;
  intercomActive: boolean;
  temporaryAccessCode?: string;
}

export interface CareAuditEntry {
  id: string;
  timestamp: string;
  eventType: 'ambient_check' | 'vitals_anomaly' | 'fall_alert' | 'medication_warning' | 'ring_unlock' | 'emergency_dispatch';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  summary: string;
  toolsInvoked: string[];
  agentReasoning: string;
  outcome: string;
}

export interface AgentActionStep {
  step: number;
  timestamp: string;
  thought: string;
  toolCall?: {
    name: string;
    arguments: Record<string, any>;
  };
  toolResult?: Record<string, any>;
  speechOutput?: string;
}

export interface AgentExecutionResult {
  speechOutput: string;
  steps: AgentActionStep[];
  status: 'resolved' | 'escalated' | 'monitoring';
  usedLiveBedrock: boolean;
}
