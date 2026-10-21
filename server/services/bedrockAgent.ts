import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { BEDROCK_TOOL_DEFINITIONS, executeToolDirectly } from '../mcp/tools.js';
import { AgentActionStep } from '../mcp/types.js';
import { telemetryState } from './telemetryState.js';

interface AgentExecutionResult {
  speechOutput: string;
  steps: AgentActionStep[];
  status: 'resolved' | 'escalated' | 'monitoring';
  usedLiveBedrock: boolean;
}

export class BedrockAlexaAgent {
  private client: BedrockRuntimeClient | null = null;
  private region: string;
  private modelId: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0';

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        this.client = new BedrockRuntimeClient({
          region: this.region,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
          }
        });
        console.log(`[BedrockAlexaAgent] Initialized with AWS Bedrock in ${this.region} (${this.modelId})`);
      } catch (err) {
        console.warn('[BedrockAlexaAgent] AWS credentials failed to initialize. Falling back to autonomous emulator.', err);
      }
    } else {
      console.log('[BedrockAlexaAgent] No AWS credentials detected. Operating in High-Fidelity Autonomous Emulator mode.');
    }
  }

  public async runAgentReasoning(inputPrompt: string): Promise<AgentExecutionResult> {
    const steps: AgentActionStep[] = [];

    // If live Bedrock is configured, attempt live Converse tool loop
    if (this.client) {
      try {
        return await this.executeLiveBedrockLoop(inputPrompt);
      } catch (err: any) {
        console.error('[BedrockAlexaAgent] Live Bedrock call failed, falling back to deterministic agentic loop:', err.message);
      }
    }

    // High-Fidelity Autonomous Agent Engine (deterministic, reliable for demo video & offline evaluation)
    return await this.executeAutonomousEmulator(inputPrompt);
  }

  private async executeLiveBedrockLoop(prompt: string): Promise<AgentExecutionResult> {
    if (!this.client) throw new Error('Bedrock client not initialized');

    const steps: AgentActionStep[] = [];
    const systemPrompt = `You are PulseGuard MCP, an ambient healthcare intelligence agent integrated into Alexa+ and Ring.
You are monitoring Eleanor Vance (78yo).
You have access to tools via Model Context Protocol (MCP) to read patient vitals, review medication adherence, control Ring security locks/cameras, and dispatch emergency escalations.
When an alert or query occurs:
1. First query telemetry via get_patient_vitals_telemetry or check_medication_adherence.
2. Synthesize clinical risk and smart home safety state.
3. If critical (e.g. fall detected, tachycardia, or severe missed anticoagulants), proactively call control_ring_security to unlock the deadbolt and dispatch_emergency_escalation.
4. Record the outcome via record_care_event_log.
5. Provide a calm, reassuring, clear spoken response intended for Eleanor over the Echo Show speaker.`;

    let messages: any[] = [
      {
        role: 'user',
        content: [{ text: prompt }]
      }
    ];

    let loopCount = 0;
    const maxLoops = 5;

    while (loopCount < maxLoops) {
      loopCount++;

      const command = new ConverseCommand({
        modelId: this.modelId,
        system: [{ text: systemPrompt }],
        messages,
        toolConfig: {
          tools: BEDROCK_TOOL_DEFINITIONS as any
        }
      });

      const response = await this.client.send(command);
      const stopReason = response.stopReason;
      const outputMessage = response.output?.message;

      if (!outputMessage) break;

      messages.push(outputMessage);

      // Check if tool calls were requested
      const toolUseBlocks = outputMessage.content?.filter((b: any) => 'toolUse' in b) || [];

      if (toolUseBlocks.length > 0) {
        const toolResults: any[] = [];

        for (const block of toolUseBlocks) {
          const toolUse = (block as any).toolUse;
          const { toolUseId, name, input } = toolUse;

          steps.push({
            step: steps.length + 1,
            timestamp: new Date().toISOString(),
            thought: `Alexa+ MCP Agent invoking ${name} to evaluate clinical context.`,
            toolCall: { name, arguments: input }
          });

          // Execute tool directly
          const result = await executeToolDirectly(name, input);

          steps[steps.length - 1].toolResult = result;

          toolResults.push({
            toolResult: {
              toolUseId,
              content: [{ json: result }]
            }
          });
        }

        messages.push({
          role: 'user',
          content: toolResults
        });
      } else {
        // Final assistant response
        const textBlock = outputMessage.content?.find((b: any) => 'text' in b);
        const speech = (textBlock as any)?.text || "Eleanor, I am right here with you. Help is on the way.";

        steps.push({
          step: steps.length + 1,
          timestamp: new Date().toISOString(),
          thought: 'Agent completed clinical evaluation and generated synthesized Alexa+ voice and visual card response.',
          speechOutput: speech
        });

        return {
          speechOutput: speech,
          steps,
          status: speech.toLowerCase().includes('emergency') || speech.toLowerCase().includes('help') ? 'escalated' : 'resolved',
          usedLiveBedrock: true
        };
      }
    }

    return {
      speechOutput: "Eleanor, I've checked your sensors and notified your daughter Sarah. I am keeping the channel open.",
      steps,
      status: 'monitoring',
      usedLiveBedrock: true
    };
  }

  private async executeAutonomousEmulator(prompt: string): Promise<AgentExecutionResult> {
    const steps: AgentActionStep[] = [];
    const lower = prompt.toLowerCase();

    // --- 0a. Emergency Interactive Reply: False Alarm / Patient Confirmed OK ---
    if (
      lower.includes('false alarm') ||
      lower.includes("i'm ok") ||
      lower.includes('i am ok') ||
      lower.includes("i'm okay") ||
      lower.includes('i am okay') ||
      lower.includes("i'm fine") ||
      lower.includes('i am fine') ||
      lower.includes('cancel emergency') ||
      lower.includes('dropped sensor')
    ) {
      // Step 1: Relock Ring deadbolt
      const ringLock = await executeToolDirectly('control_ring_security', {
        action: 'lock_smart_deadbolt',
        reason: 'Patient confirmed false alarm. Re-securing perimeter.'
      });
      steps.push({
        step: 1,
        timestamp: new Date().toISOString(),
        thought: '🔒 False alarm confirmed by patient: Invoking control_ring_security to re-lock smart deadbolt and secure perimeter.',
        toolCall: {
          name: 'control_ring_security',
          arguments: { action: 'lock_smart_deadbolt', reason: 'False alarm cancellation' }
        },
        toolResult: ringLock
      });

      // Step 2: Reset telemetry to normal resting state
      telemetryState.updateVitals({
        fallDetected: false,
        bodyOrientation: 'sitting',
        heartRate: 78,
        systolicBP: 126,
        diastolicBP: 82,
        lastMovementSecondsAgo: 2
      });

      // Step 3: Commit cancellation to DynamoDB care ledger
      const auditResult = await executeToolDirectly('record_care_event_log', {
        eventType: 'fall_alert',
        severity: 'info',
        summary: 'False alarm confirmed by Eleanor Vance. Perimeter re-locked.',
        outcome: 'Caregiver Sarah Vance notified via SMS that Eleanor is safe. Emergency triage closed.'
      });
      steps.push({
        step: 2,
        timestamp: new Date().toISOString(),
        thought: '📋 Logging cancellation to Amazon DynamoDB care store and notifying caregiver.',
        toolCall: {
          name: 'record_care_event_log',
          arguments: { eventType: 'fall_alert', severity: 'info', summary: 'False alarm resolved' }
        },
        toolResult: auditResult
      });

      const speech = "I'm so glad you're okay, Eleanor! I have secured your front deadbolt and updated your daughter Sarah that it was a false alarm. Please take a moment to rest in the living room.";
      steps.push({
        step: 3,
        timestamp: new Date().toISOString(),
        thought: 'Agent synthesized calm reassurance and transitioned Echo Show 15 back to normal ambient mode.',
        speechOutput: speech
      });

      return {
        speechOutput: speech,
        steps,
        status: 'resolved',
        usedLiveBedrock: false
      };
    }

    // --- 0b. Emergency Interactive Reply: Patient Needs Ambulance / Injured ---
    if (
      lower.includes('ambulance') ||
      lower.includes('paramedic') ||
      lower.includes('hurt') ||
      lower.includes("can't get up") ||
      lower.includes('cannot get up') ||
      lower.includes('send help') ||
      lower.includes('dispatch now')
    ) {
      // Step 1: Escalate dispatch
      const dispatchResult = await executeToolDirectly('dispatch_emergency_escalation', {
        severity: 'critical_emergency',
        sbarSummary: 'SITUATION: Patient verified acute injury and inability to rise. EMT priority 1 requested.',
        recommendedActions: ['King County EMS Unit 4 en route', 'Porch strobe illuminated', 'Access code 911-EMT active']
      });
      steps.push({
        step: 1,
        timestamp: new Date().toISOString(),
        thought: '🚨 Patient confirmed acute trauma and immobility. Escalating King County EMS priority dispatch.',
        toolCall: {
          name: 'dispatch_emergency_escalation',
          arguments: { severity: 'critical_emergency', sbarSummary: 'Patient confirmed injury' }
        },
        toolResult: dispatchResult
      });

      // Step 2: Audit log
      const auditResult = await executeToolDirectly('record_care_event_log', {
        eventType: 'emergency_dispatch',
        severity: 'emergency',
        summary: 'Ambulance dispatch confirmed by patient speech. EMS Unit 4 en route (ETA 4 min).',
        outcome: 'Front deadbolt unlocked (Code: 911-EMT). Clinical EHR displayed on Echo Show.'
      });
      steps.push({
        step: 2,
        timestamp: new Date().toISOString(),
        thought: '📋 Committing urgent ambulance dispatch record to DynamoDB.',
        toolCall: {
          name: 'record_care_event_log',
          arguments: { eventType: 'emergency_dispatch', severity: 'emergency', summary: 'Ambulance confirmed' }
        },
        toolResult: auditResult
      });

      const speech = "Eleanor, King County EMS Unit 4 has been dispatched with priority access code 911-EMT. Your front deadbolt is unlocked and the porch floodlight is on. They will arrive in approximately 4 minutes. I am staying right here with you on the screen. Please do not move.";
      steps.push({
        step: 3,
        timestamp: new Date().toISOString(),
        thought: 'Agent synthesized emergency guidance with EMT arrival ETA and responder instructions.',
        speechOutput: speech
      });

      return {
        speechOutput: speech,
        steps,
        status: 'escalated',
        usedLiveBedrock: false
      };
    }

    // --- 0c. Emergency Interactive Reply: Drop-In Call with Sarah ---
    if (
      lower.includes('call sarah') ||
      lower.includes('call my daughter') ||
      lower.includes('call daughter') ||
      lower.includes('drop-in') ||
      lower.includes('video call')
    ) {
      const auditResult = await executeToolDirectly('record_care_event_log', {
        eventType: 'ambient_check',
        severity: 'warning',
        summary: 'Emergency Echo Show Drop-In video call connected with Sarah Vance.',
        outcome: 'Two-way audio/video stream initiated on Echo Show 15.'
      });
      steps.push({
        step: 1,
        timestamp: new Date().toISOString(),
        thought: '📞 Initiating emergency Alexa Drop-In video connection between Echo Show 15 and Sarah Vance mobile app.',
        toolCall: {
          name: 'record_care_event_log',
          arguments: { eventType: 'ambient_check', severity: 'warning', summary: 'Drop-In call connected' }
        },
        toolResult: auditResult
      });

      const speech = "Starting an emergency Alexa Drop-In video call to your daughter Sarah Vance right now. The channel is open, Eleanor.";
      steps.push({
        step: 2,
        timestamp: new Date().toISOString(),
        thought: 'Two-way voice and video stream active on Echo Show.',
        speechOutput: speech
      });

      return {
        speechOutput: speech,
        steps,
        status: 'escalated',
        usedLiveBedrock: false
      };
    }

    if (lower.includes('fall') || lower.includes('impact') || lower.includes('tachycardia')) {
      // Step 1: Vitals Tool
      const vitalsResult = await executeToolDirectly('get_patient_vitals_telemetry', { patientId: 'PT-8821' });
      steps.push({
        step: 1,
        timestamp: new Date().toISOString(),
        thought: '🚨 High-severity trigger received: Accelerometer vector spike. Invoking get_patient_vitals_telemetry to verify patient stability and posture orientation.',
        toolCall: { name: 'get_patient_vitals_telemetry', arguments: { patientId: 'PT-8821' } },
        toolResult: vitalsResult
      });

      // Step 2: Emergency Dispatch Tool
      const dispatchResult = await executeToolDirectly('dispatch_emergency_escalation', {
        severity: 'critical_emergency',
        sbarSummary: 'SITUATION: 78yo female detected in abnormal supine floor orientation after 3.85G impact. Heart rate elevated to 142 bpm. No movement for >60 seconds in hallway.',
        recommendedActions: ['Auto-stage EMT access code', 'Dispatch SMS to primary caregiver Sarah Vance', 'Initiate calm Echo Show audio check-in']
      });
      steps.push({
        step: 2,
        timestamp: new Date().toISOString(),
        thought: '⚠️ Critical triage verified: Tachycardia (142 bpm) combined with post-fall immobility. Invoking dispatch_emergency_escalation.',
        toolCall: {
          name: 'dispatch_emergency_escalation',
          arguments: {
            severity: 'critical_emergency',
            sbarSummary: 'Post-impact fall detected with acute tachycardia.',
            recommendedActions: ['Notify caregiver', 'Unlock perimeter']
          }
        },
        toolResult: dispatchResult
      });

      // Step 3: Ring Security Tool (Unlock Deadbolt for first responders)
      const ringResult = await executeToolDirectly('control_ring_security', {
        action: 'unlock_smart_deadbolt',
        reason: 'Emergency dispatch staged. Unlocking Ring Smart Deadbolt to grant immediate access to responders.'
      });
      steps.push({
        step: 3,
        timestamp: new Date().toISOString(),
        thought: '🚪 Perimeter access: Invoking control_ring_security to unlock front door and illuminate Ring floodlight for arriving paramedics.',
        toolCall: {
          name: 'control_ring_security',
          arguments: { action: 'unlock_smart_deadbolt', reason: 'Emergency medical access' }
        },
        toolResult: ringResult
      });

      // Step 4: DynamoDB Care Log
      const auditResult = await executeToolDirectly('record_care_event_log', {
        eventType: 'fall_alert',
        severity: 'critical',
        summary: 'Fall detected with 142 bpm HR. Smart Deadbolt unlocked. Sarah Vance notified via AWS SNS.',
        outcome: 'Emergency handoff initiated. Perimeter secured for first responders.'
      });
      steps.push({
        step: 4,
        timestamp: new Date().toISOString(),
        thought: '📋 Compliance ledger: Invoking record_care_event_log to commit immutable audit entry to Amazon DynamoDB care store.',
        toolCall: {
          name: 'record_care_event_log',
          arguments: { eventType: 'fall_alert', severity: 'critical', summary: 'Critical fall resolved by Alexa+ agent' }
        },
        toolResult: auditResult
      });

      const speech = "Eleanor, I detected a hard fall and noticed your heart rate is rapid. Please remain still and do not try to stand up immediately. I have already contacted your daughter Sarah, unlocked the front door for emergency assistance, and I am right here on the screen with you. Can you hear me?";
      steps.push({
        step: 5,
        timestamp: new Date().toISOString(),
        thought: 'Agent synthesized empathetic Alexa+ speech response and transitioned Echo Show 15 screen to Emergency Triage mode.',
        speechOutput: speech
      });

      return {
        speechOutput: speech,
        steps,
        status: 'escalated',
        usedLiveBedrock: false
      };
    }

    // --- 1. Dose Confirmation Check (Triggered by 'Confirm Dose Taken' or spoken confirmation) ---
    if (
      lower.includes('took') ||
      lower.includes('taken') ||
      lower.includes('swallowed') ||
      lower.includes('confirm dose') ||
      lower.includes('confirm') ||
      lower.includes('already took') ||
      lower.includes('i took')
    ) {
      // Execute MCP Tool to update dispenser and normalize vitals
      const confirmResult = await executeToolDirectly('confirm_patient_medication_intake', {
        medicationId: 'med-3',
        notes: 'Confirmed by Eleanor Vance via Echo Show 15 touch'
      });

      steps.push({
        step: 1,
        timestamp: new Date().toISOString(),
        thought: '✅ Ingestion verified: Invoking confirm_patient_medication_intake to mark smart dispenser slot 3 as compliant and normalize telemetry.',
        toolCall: {
          name: 'confirm_patient_medication_intake',
          arguments: { medicationId: 'med-3' }
        },
        toolResult: confirmResult
      });

      // Log to DynamoDB Care Ledger
      const auditResult = await executeToolDirectly('record_care_event_log', {
        eventType: 'ambient_check',
        severity: 'info',
        summary: 'Eliquis 5mg confirmed taken. Daily medication adherence restored to 100%.',
        outcome: 'Dispenser slot 3 cleared. Eleanor vitals normalized (BP 122/80, HR 74).'
      });

      steps.push({
        step: 2,
        timestamp: new Date().toISOString(),
        thought: '📋 Ledger committed: Invoking record_care_event_log to update DynamoDB adherence record.',
        toolCall: {
          name: 'record_care_event_log',
          arguments: { eventType: 'ambient_check', severity: 'info', summary: 'Dose taken confirmed' }
        },
        toolResult: auditResult
      });

      const speech = "Wonderful, Eleanor! I have recorded your Eliquis dose as taken, and your daughter Sarah has been notified. Your blood pressure and heart rate are steady, and all your medications for today are complete.";
      steps.push({
        step: 3,
        timestamp: new Date().toISOString(),
        thought: 'Agent synthesized warm confirmation response and returned Echo Show 15 to peaceful ambient mode.',
        speechOutput: speech
      });

      return {
        speechOutput: speech,
        steps,
        status: 'resolved',
        usedLiveBedrock: false
      };
    }

    // --- 2. Snooze Reminder Check ---
    if (lower.includes('snooze') || lower.includes('15 minutes') || lower.includes('later') || lower.includes('remind me again')) {
      // Reset to pending so alert is dismissed
      telemetryState.updateMedication('med-3', { status: 'pending' });

      const updateResult = await executeToolDirectly('record_care_event_log', {
        eventType: 'medication_warning',
        severity: 'info',
        summary: 'Eliquis 5mg reminder snoozed for 15 minutes by Eleanor.',
        outcome: 'Follow-up reminder timer armed. Display alert cleared temporarily.'
      });

      steps.push({
        step: 1,
        timestamp: new Date().toISOString(),
        thought: '⏰ Snooze requested: Setting 15-minute re-evaluation timer for Eliquis anticoagulant reminder.',
        toolCall: {
          name: 'record_care_event_log',
          arguments: { eventType: 'medication_warning', severity: 'info', summary: 'Snoozed 15 min' }
        },
        toolResult: updateResult
      });

      const speech = "Understood, Eleanor. I will remind you again in 15 minutes. Please be sure to drink a glass of water when you take it.";
      steps.push({
        step: 2,
        timestamp: new Date().toISOString(),
        thought: 'Agent acknowledged snooze request and dismissed alert on screen.',
        speechOutput: speech
      });

      return {
        speechOutput: speech,
        steps,
        status: 'resolved',
        usedLiveBedrock: false
      };
    }

    if (lower.includes('medication') || lower.includes('meds') || lower.includes('eliquis') || lower.includes('dose')) {
      // Step 1: Medication Tool
      const medsResult = await executeToolDirectly('check_medication_adherence', { patientId: 'PT-8821' });
      steps.push({
        step: 1,
        timestamp: new Date().toISOString(),
        thought: '💊 Medication adherence check: Invoking check_medication_adherence to query smart pill dispenser sensors.',
        toolCall: { name: 'check_medication_adherence', arguments: { patientId: 'PT-8821' } },
        toolResult: medsResult
      });

      // Step 2: Vitals cross-reference
      const vitalsResult = await executeToolDirectly('get_patient_vitals_telemetry', { patientId: 'PT-8821' });
      steps.push({
        step: 2,
        timestamp: new Date().toISOString(),
        thought: '🩺 Correlating adherence with current blood pressure and pulse: BP is elevated at 148/94 mmHg.',
        toolCall: { name: 'get_patient_vitals_telemetry', arguments: { patientId: 'PT-8821' } },
        toolResult: vitalsResult
      });

      // Step 3: Audit log
      const auditResult = await executeToolDirectly('record_care_event_log', {
        eventType: 'medication_warning',
        severity: 'warning',
        summary: 'Eliquis 5mg is 140 minutes overdue. Patient alerted via Echo Show 15 audio and visual prompt.',
        outcome: 'Visual dispenser slot 3 highlighted on smart screen.'
      });
      steps.push({
        step: 3,
        timestamp: new Date().toISOString(),
        thought: '📋 Committing adherence reminder to cloud audit ledger.',
        toolCall: {
          name: 'record_care_event_log',
          arguments: { eventType: 'medication_warning', severity: 'warning', summary: 'Eliquis missed dose reminder' }
        },
        toolResult: auditResult
      });

      const speech = "Eleanor, a quick reminder for your heart health: Your evening Eliquis anticoagulant is in dispenser slot 3 and was scheduled for 6:00 PM. I've highlighted the slot on your screen. Would you like a glass of water before you take it?";
      steps.push({
        step: 4,
        timestamp: new Date().toISOString(),
        thought: 'Agent synthesized proactive Alexa+ medication reminder with visual guidance card on display.',
        speechOutput: speech
      });

      return {
        speechOutput: speech,
        steps,
        status: 'resolved',
        usedLiveBedrock: false
      };
    }

    if (lower.includes('doorbell') || lower.includes('ring') || lower.includes('visitor') || lower.includes('paramedic')) {
      // Step 1: Ring Perimeter Status
      const ringResult = await executeToolDirectly('control_ring_security', {
        action: 'get_perimeter_status',
        reason: 'Verifying visitor identification at front entry'
      });
      steps.push({
        step: 1,
        timestamp: new Date().toISOString(),
        thought: '🔔 Ring Doorbell event detected: Invoking control_ring_security to inspect camera stream and visitor classification.',
        toolCall: {
          name: 'control_ring_security',
          arguments: { action: 'get_perimeter_status', reason: 'Visitor screening' }
        },
        toolResult: ringResult
      });

      // Step 2: Unlock Deadbolt
      const unlockResult = await executeToolDirectly('control_ring_security', {
        action: 'unlock_smart_deadbolt',
        reason: 'Paramedics confirmed via Ring Video Doorbell. Unlocking deadbolt.'
      });
      steps.push({
        step: 2,
        timestamp: new Date().toISOString(),
        thought: '✅ Visitor verified as First Responders / Caregiver. Unlocking smart deadbolt.',
        toolCall: {
          name: 'control_ring_security',
          arguments: { action: 'unlock_smart_deadbolt', reason: 'Paramedics verified' }
        },
        toolResult: unlockResult
      });

      // Step 3: Broadcast intercom
      const intercomResult = await executeToolDirectly('control_ring_security', {
        action: 'broadcast_intercom',
        reason: 'Providing entry instructions to responder',
        intercomMessage: 'Door is unlocked. Eleanor is in the hallway. PulseGuard medical file is loaded on the kitchen Echo Show.'
      });
      steps.push({
        step: 3,
        timestamp: new Date().toISOString(),
        thought: '🎙️ Ring Intercom Broadcast: Transmitting entry clearance and patient location to the front porch.',
        toolCall: {
          name: 'control_ring_security',
          arguments: { action: 'broadcast_intercom', intercomMessage: 'Door unlocked, patient in hallway' }
        },
        toolResult: intercomResult
      });

      const speech = "Eleanor, the emergency responders have arrived at the front door. I have unlocked the deadbolt for them and announced through the Ring intercom that you are in the hallway. They are entering now.";
      steps.push({
        step: 4,
        timestamp: new Date().toISOString(),
        thought: 'Echo Show updated with Ring live camera preview and arrival confirmation.',
        speechOutput: speech
      });

      return {
        speechOutput: speech,
        steps,
        status: 'resolved',
        usedLiveBedrock: false
      };
    }

    // Default Ambient Wellness Check
    const vitalsResult = await executeToolDirectly('get_patient_vitals_telemetry', {});
    const medsResult = await executeToolDirectly('check_medication_adherence', {});

    steps.push({
      step: 1,
      timestamp: new Date().toISOString(),
      thought: '🌿 Routine ambient wellness check: Querying vitals telemetry and smart home sensors.',
      toolCall: { name: 'get_patient_vitals_telemetry', arguments: {} },
      toolResult: vitalsResult
    });

    steps.push({
      step: 2,
      timestamp: new Date().toISOString(),
      thought: '🔍 Inspecting medication adherence compliance.',
      toolCall: { name: 'check_medication_adherence', arguments: {} },
      toolResult: medsResult
    });

    const speech = `Good evening Eleanor. Your vitals are looking steady with a resting pulse of ${vitalsResult.heartRate} beats per minute and 98% oxygen. Your morning prescriptions are all logged. All perimeter doors are securely locked. Let me know if you need anything!`;

    steps.push({
      step: 3,
      timestamp: new Date().toISOString(),
      thought: 'Agent verified normal parameters. Displaying calm ambient dashboard.',
      speechOutput: speech
    });

    return {
      speechOutput: speech,
      steps,
      status: 'resolved',
      usedLiveBedrock: false
    };
  }
}

export const bedrockAgent = new BedrockAlexaAgent();
