import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerMcpTools, BEDROCK_TOOL_DEFINITIONS } from './mcp/tools.js';
import { telemetryState } from './services/telemetryState.js';
import { bedrockAgent } from './services/bedrockAgent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Model Context Protocol (MCP) Server instance
const mcpServer = new McpServer({
  name: 'pulseguard-mcp',
  version: '1.0.0'
});

registerMcpTools(mcpServer);

// --- Standard MCP SSE Transport Endpoint for Alexa+ Agents ---
app.get('/mcp/sse', async (req, res) => {
  console.log('[MCP] Inbound SSE connection from Alexa+ Client');
  const transport = new SSEServerTransport('/mcp/messages', res);
  await mcpServer.connect(transport);
});

app.post('/mcp/messages', async (req, res) => {
  // Handled by SSEServerTransport
  res.status(200).end();
});

// --- REST APIs for the Alexa+ Web Simulator & Command Center ---

// 1. Get live telemetry & status
app.get('/api/state', (req, res) => {
  res.json({
    vitals: telemetryState.getVitals(),
    medications: telemetryState.getMedications(),
    ring: telemetryState.getRingSecurity(),
    auditLogs: telemetryState.getAuditLogs()
  });
});

// 2. Query individual components
app.get('/api/vitals', (req, res) => {
  res.json(telemetryState.getVitals());
});

app.post('/api/vitals', (req, res) => {
  const updated = telemetryState.updateVitals(req.body);
  res.json(updated);
});

app.get('/api/medications', (req, res) => {
  res.json(telemetryState.getMedications());
});

app.get('/api/ring', (req, res) => {
  res.json(telemetryState.getRingSecurity());
});

app.post('/api/ring/toggle-lock', (req, res) => {
  const current = telemetryState.getRingSecurity();
  const nextLock = current.doorLockState === 'locked' ? 'unlocked' : 'locked';
  const updated = telemetryState.updateRingSecurity({ doorLockState: nextLock });
  res.json(updated);
});

app.get('/api/audit-logs', (req, res) => {
  res.json(telemetryState.getAuditLogs());
});

// 3. Trigger 1-Click Interactive Scenarios (For Video Demo & Judges)
app.post('/api/trigger-scenario', async (req, res) => {
  const { scenarioId } = req.body;
  const triggerResult = telemetryState.triggerScenario(scenarioId);

  // Automatically trigger Alexa+ Bedrock agent reasoning if it is an alert scenario
  let agentExecution = null;
  if (scenarioId !== 'reset_normal') {
    agentExecution = await bedrockAgent.runAgentReasoning(triggerResult.triggerPrompt);
  }

  res.json({
    scenario: triggerResult,
    agentExecution,
    currentState: {
      vitals: telemetryState.getVitals(),
      medications: telemetryState.getMedications(),
      ring: telemetryState.getRingSecurity(),
      auditLogs: telemetryState.getAuditLogs()
    }
  });
});

// 3b. Medication Direct Actions (Confirm Dose / Snooze)
app.post('/api/medications/confirm', async (req, res) => {
  const { medicationId = 'med-3' } = req.body;
  telemetryState.updateMedication(medicationId, { status: 'taken' });
  telemetryState.updateVitals({
    systolicBP: 122,
    diastolicBP: 80,
    heartRate: 74
  });
  const agentExecution = await bedrockAgent.runAgentReasoning("Patient Eleanor Vance confirmed ingestion of Eliquis dose");
  res.json({
    success: true,
    agentExecution,
    currentState: {
      vitals: telemetryState.getVitals(),
      medications: telemetryState.getMedications(),
      ring: telemetryState.getRingSecurity(),
      auditLogs: telemetryState.getAuditLogs()
    }
  });
});

app.post('/api/medications/snooze', async (req, res) => {
  const { medicationId = 'med-3' } = req.body;
  telemetryState.updateMedication(medicationId, { status: 'pending' });
  const agentExecution = await bedrockAgent.runAgentReasoning("Remind me again in 15 minutes for medication");
  res.json({
    success: true,
    agentExecution,
    currentState: {
      vitals: telemetryState.getVitals(),
      medications: telemetryState.getMedications(),
      ring: telemetryState.getRingSecurity(),
      auditLogs: telemetryState.getAuditLogs()
    }
  });
});

// 3c. Emergency Interactive Actions (False Alarm / Dispatch 911 / Drop-In)
app.post('/api/emergency/cancel-false-alarm', async (req, res) => {
  const agentExecution = await bedrockAgent.runAgentReasoning("False alarm, I am okay. Please cancel emergency.");
  res.json({
    success: true,
    agentExecution,
    currentState: {
      vitals: telemetryState.getVitals(),
      medications: telemetryState.getMedications(),
      ring: telemetryState.getRingSecurity(),
      auditLogs: telemetryState.getAuditLogs()
    }
  });
});

app.post('/api/emergency/dispatch-now', async (req, res) => {
  const agentExecution = await bedrockAgent.runAgentReasoning("I cannot get up, I hurt my hip. Please dispatch an ambulance now.");
  res.json({
    success: true,
    agentExecution,
    currentState: {
      vitals: telemetryState.getVitals(),
      medications: telemetryState.getMedications(),
      ring: telemetryState.getRingSecurity(),
      auditLogs: telemetryState.getAuditLogs()
    }
  });
});

app.post('/api/emergency/drop-in', async (req, res) => {
  const agentExecution = await bedrockAgent.runAgentReasoning("Please call my daughter Sarah right now via Drop-In.");
  res.json({
    success: true,
    agentExecution,
    currentState: {
      vitals: telemetryState.getVitals(),
      medications: telemetryState.getMedications(),
      ring: telemetryState.getRingSecurity(),
      auditLogs: telemetryState.getAuditLogs()
    }
  });
});

// 4. Alexa+ Voice / Chat Interaction (Runs full Bedrock MCP Tool reasoning loop)
app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const executionResult = await bedrockAgent.runAgentReasoning(prompt);
    res.json({
      executionResult,
      currentState: {
        vitals: telemetryState.getVitals(),
        medications: telemetryState.getMedications(),
        ring: telemetryState.getRingSecurity(),
        auditLogs: telemetryState.getAuditLogs()
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Inspect Registered MCP Tool Schemas (Bedrock / MCP compliance verification)
app.get('/api/mcp/tools', (req, res) => {
  res.json({
    protocol: 'Model Context Protocol (MCP) 2024-11-05',
    server: 'pulseguard-mcp v1.0.0',
    transport: 'SSE (/mcp/sse)',
    tools: BEDROCK_TOOL_DEFINITIONS
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  🛡️  PulseGuard MCP Server running on port ${PORT}`);
  console.log(`  📡  MCP SSE Endpoint: http://localhost:${PORT}/mcp/sse`);
  console.log(`  🔧  API Tool Inspector: http://localhost:${PORT}/api/mcp/tools`);
  console.log(`======================================================\n`);
});
