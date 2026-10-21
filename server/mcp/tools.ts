import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { telemetryState } from '../services/telemetryState.js';

// Standard tool definition schemas for Amazon Bedrock / Nova Converse API
export const BEDROCK_TOOL_DEFINITIONS = [
  {
    toolSpec: {
      name: 'get_patient_vitals_telemetry',
      description: 'Retrieves real-time vital signs, accelerometer fall telemetry, posture orientation, and room presence sensor data for the monitored patient.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            patientId: {
              type: 'string',
              description: 'The unique patient identifier (e.g. PT-8821)'
            }
          }
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'check_medication_adherence',
      description: 'Queries smart dispenser slots and prescription schedules to detect missed doses, critical medication interaction warnings, and compliance timestamps.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            patientId: {
              type: 'string',
              description: 'The unique patient identifier'
            }
          }
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'control_ring_security',
      description: 'Interacts with Ring Video Doorbell and Ring Smart Deadbolt to view live perimeter camera status, unlock the front door for verified emergency responders or caregivers, or broadcast intercom voice.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['get_perimeter_status', 'unlock_smart_deadbolt', 'lock_smart_deadbolt', 'broadcast_intercom'],
              description: 'Action to perform on the Ring security perimeter'
            },
            reason: {
              type: 'string',
              description: 'Clinical or safety justification for the perimeter action'
            },
            intercomMessage: {
              type: 'string',
              description: 'Optional voice message to announce through the Ring Doorbell speaker'
            }
          },
          required: ['action', 'reason']
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'dispatch_emergency_escalation',
      description: 'Escalates a critical patient safety event by generating an SBAR clinical triage note, notifying the primary caregiver emergency contact via SMS/push, and staging emergency access.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            severity: {
              type: 'string',
              enum: ['low', 'moderate', 'high', 'critical_emergency'],
              description: 'Triage priority level'
            },
            sbarSummary: {
              type: 'string',
              description: 'Structured SBAR (Situation, Background, Assessment, Recommendation) summary of the event'
            },
            recommendedActions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Immediate actions recommended for caregivers or emergency responders'
            }
          },
          required: ['severity', 'sbarSummary', 'recommendedActions']
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'record_care_event_log',
      description: 'Appends an immutable clinical care and smart home audit event to the cloud care ledger (Amazon DynamoDB) for clinical review and caregiver visibility.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            eventType: {
              type: 'string',
              enum: ['ambient_check', 'vitals_anomaly', 'fall_alert', 'medication_warning', 'ring_unlock', 'emergency_dispatch'],
              description: 'Category of the care event'
            },
            severity: {
              type: 'string',
              enum: ['info', 'warning', 'critical', 'emergency'],
              description: 'Severity classification'
            },
            summary: {
              type: 'string',
              description: 'Concise incident summary'
            },
            outcome: {
              type: 'string',
              description: 'Immediate result or resolution of the agent action'
            }
          },
          required: ['eventType', 'severity', 'summary', 'outcome']
        }
      }
    }
  }
];

// Register tools into the Model Context Protocol (MCP) server instance
export function registerMcpTools(server: McpServer) {
  // 1. Vitals Telemetry Tool
  server.tool(
    'get_patient_vitals_telemetry',
    {
      patientId: z.string().optional().describe('Patient ID to query')
    },
    async ({ patientId }) => {
      const vitals = telemetryState.getVitals();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(vitals, null, 2)
          }
        ]
      };
    }
  );

  // 2. Medication Adherence Tool
  server.tool(
    'check_medication_adherence',
    {
      patientId: z.string().optional().describe('Patient ID to query')
    },
    async () => {
      const meds = telemetryState.getMedications();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              totalPrescriptions: meds.length,
              adherenceStatus: meds.every(m => m.status === 'taken') ? 'all_compliant' : 'action_required',
              medications: meds
            }, null, 2)
          }
        ]
      };
    }
  );

  // 3. Ring Security Tool
  server.tool(
    'control_ring_security',
    {
      action: z.enum(['get_perimeter_status', 'unlock_smart_deadbolt', 'lock_smart_deadbolt', 'broadcast_intercom']),
      reason: z.string().describe('Clinical or safety justification'),
      intercomMessage: z.string().optional().describe('Message to broadcast')
    },
    async ({ action, reason, intercomMessage }) => {
      const ring = telemetryState.getRingSecurity();

      if (action === 'unlock_smart_deadbolt') {
        const oneTimeCode = Math.floor(1000 + Math.random() * 9000).toString();
        telemetryState.updateRingSecurity({
          doorLockState: 'unlocked',
          temporaryAccessCode: oneTimeCode
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'success',
                doorLockState: 'unlocked',
                accessCodeGenerated: oneTimeCode,
                reason,
                message: 'Ring Smart Deadbolt unlocked. Perimeter floodlight activated for responder visibility.'
              }, null, 2)
            }
          ]
        };
      }

      if (action === 'lock_smart_deadbolt') {
        telemetryState.updateRingSecurity({ doorLockState: 'locked' });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'success',
                doorLockState: 'locked',
                reason
              }, null, 2)
            }
          ]
        };
      }

      if (action === 'broadcast_intercom') {
        telemetryState.updateRingSecurity({ intercomActive: true });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'success',
                intercomBroadcast: intercomMessage,
                visitorAcknowledged: true
              }, null, 2)
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(ring, null, 2)
          }
        ]
      };
    }
  );

  // 4. Emergency Dispatch Tool
  server.tool(
    'dispatch_emergency_escalation',
    {
      severity: z.enum(['low', 'moderate', 'high', 'critical_emergency']),
      sbarSummary: z.string(),
      recommendedActions: z.array(z.string())
    },
    async ({ severity, sbarSummary, recommendedActions }) => {
      const dispatchId = `DISPATCH-AWS-${Date.now().toString().slice(-6)}`;
      
      // Auto-unlock front door if critical emergency
      if (severity === 'critical_emergency' || severity === 'high') {
        telemetryState.updateRingSecurity({
          doorLockState: 'unlocked',
          temporaryAccessCode: '911-EMT'
        });
      }

      const alertPayload = {
        dispatchId,
        timestamp: new Date().toISOString(),
        severity,
        sbarSummary,
        recommendedActions,
        smsBroadcastSent: true,
        primaryCaregiver: 'Sarah Vance (Daughter) - (555) 321-9876 [Alert Confirmed]',
        emergencyServicesNotified: severity === 'critical_emergency',
        smartAccessGranted: severity === 'critical_emergency' || severity === 'high'
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(alertPayload, null, 2)
          }
        ]
      };
    }
  );

  // 5. Cloud Audit Log Tool
  server.tool(
    'record_care_event_log',
    {
      eventType: z.enum(['ambient_check', 'vitals_anomaly', 'fall_alert', 'medication_warning', 'ring_unlock', 'emergency_dispatch']),
      severity: z.enum(['info', 'warning', 'critical', 'emergency']),
      summary: z.string(),
      outcome: z.string()
    },
    async ({ eventType, severity, summary, outcome }) => {
      const entry = telemetryState.addAuditLog({
        eventType: eventType as any,
        severity: severity as any,
        summary,
        toolsInvoked: ['record_care_event_log'],
        agentReasoning: `Automated Alexa+ MCP audit ledger write: ${summary}`,
        outcome
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              dynamoDbStatus: 'SUCCESS_WRITTEN_200',
              recordId: entry.id,
              ledgerHash: `sha256_${Date.now()}_aws_pulseguard`,
              entry
            }, null, 2)
          }
        ]
      };
    }
  );
}

// Direct executor for Bedrock tool calls within the Express / Agent loop
export async function executeToolDirectly(toolName: string, args: Record<string, any>): Promise<any> {
  switch (toolName) {
    case 'get_patient_vitals_telemetry':
      return telemetryState.getVitals();

    case 'check_medication_adherence': {
      const meds = telemetryState.getMedications();
      return {
        totalPrescriptions: meds.length,
        adherenceStatus: meds.every(m => m.status === 'taken') ? 'all_compliant' : 'action_required',
        medications: meds
      };
    }

    case 'control_ring_security': {
      const { action, reason, intercomMessage } = args;
      const ring = telemetryState.getRingSecurity();
      if (action === 'unlock_smart_deadbolt') {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        telemetryState.updateRingSecurity({
          doorLockState: 'unlocked',
          temporaryAccessCode: code
        });
        return {
          status: 'success',
          doorLockState: 'unlocked',
          accessCodeGenerated: code,
          reason,
          message: 'Ring Smart Deadbolt unlocked. Perimeter floodlight activated for responder visibility.'
        };
      }
      if (action === 'lock_smart_deadbolt') {
        telemetryState.updateRingSecurity({ doorLockState: 'locked' });
        return { status: 'success', doorLockState: 'locked', reason };
      }
      if (action === 'broadcast_intercom') {
        telemetryState.updateRingSecurity({ intercomActive: true });
        return { status: 'success', intercomBroadcast: intercomMessage, visitorAcknowledged: true };
      }
      return ring;
    }

    case 'dispatch_emergency_escalation': {
      const { severity, sbarSummary, recommendedActions } = args;
      const dispatchId = `DISPATCH-AWS-${Date.now().toString().slice(-6)}`;
      if (severity === 'critical_emergency' || severity === 'high') {
        telemetryState.updateRingSecurity({
          doorLockState: 'unlocked',
          temporaryAccessCode: '911-EMT'
        });
      }
      return {
        dispatchId,
        timestamp: new Date().toISOString(),
        severity,
        sbarSummary,
        recommendedActions,
        smsBroadcastSent: true,
        primaryCaregiver: 'Sarah Vance (Daughter) - (555) 321-9876 [Alert Confirmed]',
        emergencyServicesNotified: severity === 'critical_emergency',
        smartAccessGranted: severity === 'critical_emergency' || severity === 'high'
      };
    }

    case 'record_care_event_log': {
      const { eventType, severity, summary, outcome } = args;
      const entry = telemetryState.addAuditLog({
        eventType,
        severity,
        summary,
        toolsInvoked: ['record_care_event_log'],
        agentReasoning: `Automated Alexa+ MCP audit ledger write: ${summary}`,
        outcome
      });
      return {
        dynamoDbStatus: 'SUCCESS_WRITTEN_200',
        recordId: entry.id,
        entry
      };
    }

    default:
      throw new Error(`Unknown MCP Tool: ${toolName}`);
  }
}
