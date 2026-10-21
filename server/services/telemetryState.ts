import { PatientVitals, MedicationItem, RingSecurityState, CareAuditEntry } from '../mcp/types.js';

class TelemetryStateManager {
  private vitals: PatientVitals = {
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
  };

  private medications: MedicationItem[] = [
    {
      id: 'med-1',
      name: 'Lisinopril',
      dosage: '10mg Tablet (Hypertension)',
      scheduledTime: '09:00 AM',
      status: 'taken',
      dispenserSlot: 1,
      warningIfMissed: 'Risk of elevated blood pressure and morning dizziness'
    },
    {
      id: 'med-2',
      name: 'Metformin HCl',
      dosage: '500mg Extended Release (Type 2 Diabetes)',
      scheduledTime: '12:30 PM',
      status: 'taken',
      dispenserSlot: 2,
      warningIfMissed: 'Risk of hyperglycemia'
    },
    {
      id: 'med-3',
      name: 'Eliquis (Apixaban)',
      dosage: '5mg (Atrial Fibrillation Anticoagulant)',
      scheduledTime: '06:00 PM',
      status: 'pending',
      dispenserSlot: 3,
      warningIfMissed: 'CRITICAL: High risk of thromboembolism if skipped past 2 hours'
    }
  ];

  private ringSecurity: RingSecurityState = {
    doorbellState: 'idle',
    doorLockState: 'locked',
    visitorType: 'none',
    cameraSnapshotUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&auto=format&fit=crop&q=80',
    intercomActive: false,
    temporaryAccessCode: undefined
  };

  private auditLogs: CareAuditEntry[] = [
    {
      id: 'log-001',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      eventType: 'ambient_check',
      severity: 'info',
      summary: 'Automated morning routine check completed. Vitals stable.',
      toolsInvoked: ['get_patient_vitals_telemetry'],
      agentReasoning: 'Scheduled 9:00 AM wellness audit: HR 71 bpm, SpO2 98%, patient active in kitchen.',
      outcome: 'No escalation required. Caregiver daily digest updated.'
    }
  ];

  public getVitals(): PatientVitals {
    return { ...this.vitals, timestamp: new Date().toISOString() };
  }

  public updateVitals(partial: Partial<PatientVitals>): PatientVitals {
    this.vitals = { ...this.vitals, ...partial, timestamp: new Date().toISOString() };
    return this.vitals;
  }

  public getMedications(): MedicationItem[] {
    return [...this.medications];
  }

  public updateMedication(id: string, partial: Partial<MedicationItem>): MedicationItem | undefined {
    const index = this.medications.findIndex(m => m.id === id);
    if (index !== -1) {
      this.medications[index] = { ...this.medications[index], ...partial };
      return this.medications[index];
    }
    return undefined;
  }

  public getRingSecurity(): RingSecurityState {
    return { ...this.ringSecurity };
  }

  public updateRingSecurity(partial: Partial<RingSecurityState>): RingSecurityState {
    this.ringSecurity = { ...this.ringSecurity, ...partial };
    return this.ringSecurity;
  }

  public getAuditLogs(): CareAuditEntry[] {
    return [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addAuditLog(entry: Omit<CareAuditEntry, 'id' | 'timestamp'>): CareAuditEntry {
    const newEntry: CareAuditEntry = {
      ...entry,
      id: `log-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newEntry);
    return newEntry;
  }

  // Pre-configured Scenarios for one-click demo triggers
  public triggerScenario(scenarioId: 'fall_emergency' | 'missed_meds' | 'first_responder_arrival' | 'reset_normal') {
    switch (scenarioId) {
      case 'fall_emergency':
        this.updateVitals({
          heartRate: 142,
          spO2: 91,
          systolicBP: 168,
          diastolicBP: 104,
          fallDetected: true,
          impactGForce: 3.85,
          bodyOrientation: 'fallen_abnormal',
          lastMovementSecondsAgo: 74,
          currentRoom: 'Hallway / Living Room Boundary'
        });
        return {
          scenario: 'fall_emergency',
          triggerPrompt: 'ALERT: Patient Eleanor Vance wearable sensor registered 3.85G impact fall and abnormal supine orientation with tachycardia (142 bpm) and no movement for 74s.'
        };

      case 'missed_meds':
        this.updateMedication('med-3', { status: 'missed' });
        this.updateVitals({
          heartRate: 98,
          spO2: 96,
          systolicBP: 148,
          diastolicBP: 94,
          fallDetected: false,
          bodyOrientation: 'sitting',
          lastMovementSecondsAgo: 15,
          currentRoom: 'Kitchen'
        });
        return {
          scenario: 'missed_meds',
          triggerPrompt: 'NOTICE: Eliquis 5mg was scheduled for 06:00 PM and is now 140 minutes overdue. Smart pill dispenser slot 3 has not been opened.'
        };

      case 'first_responder_arrival':
        this.updateRingSecurity({
          doorbellState: 'ring_active',
          visitorType: 'first_responder',
          cameraSnapshotUrl: 'https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=800&auto=format&fit=crop&q=80',
          intercomActive: true
        });
        return {
          scenario: 'first_responder_arrival',
          triggerPrompt: 'EVENT: Ring Video Doorbell Pro detected Paramedic / EMT unit at the front door following emergency escalation.'
        };

      case 'reset_normal':
        this.vitals = {
          patientId: 'PT-8821',
          name: 'Eleanor Vance',
          age: 78,
          heartRate: 72,
          spO2: 98,
          systolicBP: 122,
          diastolicBP: 80,
          fallDetected: false,
          impactGForce: 1.01,
          bodyOrientation: 'standing',
          lastMovementSecondsAgo: 4,
          currentRoom: 'Living Room',
          timestamp: new Date().toISOString()
        };
        this.ringSecurity = {
          doorbellState: 'idle',
          doorLockState: 'locked',
          visitorType: 'none',
          cameraSnapshotUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&auto=format&fit=crop&q=80',
          intercomActive: false,
          temporaryAccessCode: undefined
        };
        this.medications[2].status = 'pending';
        return {
          scenario: 'reset_normal',
          triggerPrompt: 'STATUS: All patient vitals, Ring perimeter locks, and ambient sensors reset to baseline normal.'
        };
    }
  }
}

export const telemetryState = new TelemetryStateManager();
