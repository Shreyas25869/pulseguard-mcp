# Devpost Submission Blueprint: PulseGuard MCP

---

### Project Title
**PulseGuard MCP — Proactive Ambient Healthcare & Emergency Copilot for Alexa+**

### Elevator Pitch / Tagline
*An autonomous ambient healthcare copilot powered by Alexa+ and Model Context Protocol (MCP) that transforms the smart home from a passive voice assistant into a life-saving, proactive guardian.*

---

### Track & Challenge Selection
* **Primary Track:** Alexa+ (Agent Skills / Model Context Protocol)
* **Mini-Challenge 1:** AWS Builder (Amazon Bedrock Nova Pro / Claude, Amazon DynamoDB, AWS SNS)
* **Mini-Challenge 2:** Open Source (Public GitHub Repository with MIT License)
* **Special Category:** Developer Experience & Friction Log (Eligible for up to 10% bonus)

---

### Inspiration
Over 54 million seniors in the United States and hundreds of millions worldwide live independently. While devices like the Amazon Echo Show and Ring Video Doorbell are commonplace in elderly households, traditional voice assistants suffer from one fatal flaw: **they are entirely passive**. 

If an 78-year-old falls in the hallway, experiences cardiac tachycardia, or misses a critical anticoagulant medication, a passive assistant does nothing until someone speaks the wake word. When someone is in distress, they often cannot speak or reach a phone.

With Amazon's newest leap into **Alexa+** and the adoption of open agentic standards like the **Model Context Protocol (MCP)**, we realized we could bridge this divide. What if Alexa+ didn't wait to be spoken to? What if it could autonomously perceive telemetry anomalies, reason through clinical protocols, interact with Ring perimeter deadbolts, and coordinate emergency dispatch?

That was the birth of **PulseGuard MCP**.

---

### What PulseGuard MCP Does
PulseGuard MCP turns an Echo Show 15 and connected smart home devices into an ambient clinical guardian:

1. **Autonomous Telemetry Monitoring via MCP:**
   Continuously ingests simulated wearable sensor data (heart rate, SpO2, accelerometer vectors, posture orientation, and room presence) through standard MCP tools.

2. **Proactive Agentic Reasoning (Amazon Bedrock Nova / Claude):**
   When an anomaly occurs (e.g., a 3.85G impact fall followed by 142 bpm tachycardia and 74 seconds of stillness), the Alexa+ Agent initiates an autonomous multi-step reasoning loop rather than a static canned response.

3. **Perimeter Security Coordination (Ring Video & Smart Deadbolt):**
   During critical emergencies, PulseGuard MCP calls `control_ring_security` to automatically disengage the Ring Smart Deadbolt, stage a temporary access code (`911-EMT`), activate porch floodlights, and broadcast entry clearance instructions over the Ring Intercom.

4. **Multi-Modal Echo Show 15 Display:**
   Switches the smart screen dynamically between peaceful ambient artwork, proactive medication adherence guidance (with highlighted dispenser slots), and high-contrast emergency triage cards with live audio waveforms.

5. **Immutable Cloud Care Ledger (Amazon DynamoDB):**
   Logs every vital sign deviation, caregiver SMS alert, and perimeter unlock with cryptographic audit hashing for family peace of mind and clinical continuity of care.

---

### How We Built It
* **Model Context Protocol (MCP):** Implemented an open-standard MCP server in TypeScript using `@modelcontextprotocol/sdk` exposing 5 clinical and smart home tools over Server-Sent Events (`/mcp/sse`).
* **Agent Intelligence:** Powered by **Amazon Bedrock Converse API** supporting **Amazon Nova Pro** and **Anthropic Claude 3.5 Sonnet** with autonomous tool-use orchestration.
* **Smart Perimeter:** Integrated with Ring Video Doorbell and Ring Smart Deadbolt simulation endpoints.
* **Interactive Echo Show Simulator:** Built a high-fidelity, real-time web application using React 19, TypeScript, Vite, Tailwind CSS v4, and the Web Speech API for authentic voice synthesis.
* **AWS Cloud Ledger:** Structured DynamoDB event logs for automated audit compliance.

---

### Key Scenarios Demonstrable in the MVP
1. **Scenario 1: Critical Fall with Tachycardia**
   * Wearable sensor registers 3.85G impact in hallway; heart rate spikes to 142 bpm.
   * Alexa+ executes `get_patient_vitals_telemetry` -> reasons tachycardia + immobility -> executes `dispatch_emergency_escalation` -> executes `control_ring_security(unlock)` -> speaks reassuringly to Eleanor over the Echo Show.
2. **Scenario 2: Overdue Critical Anticoagulant (Eliquis)**
   * Smart pill dispenser detects slot 3 was missed by 140 minutes.
   * Alexa+ queries medication schedule, checks current blood pressure (148/94), illuminates slot 3 on screen, and delivers a gentle voice reminder.
3. **Scenario 3: Paramedic Arrival at Ring Video Doorbell**
   * Ring Doorbell detects EMT unit. Alexa+ broadcasts clearance through Ring Intercom and displays the live porch camera feed on the Echo Show.
4. **Scenario 4: Baseline Normal & Scheduled Wellness Audit**
   * Routine scheduled check-in verifying vitals, locking deadbolts, and maintaining daily logs.

---

### Challenges We Overcame
1. **Bridging Zod Schemas to Bedrock:** Standard MCP tools use Zod schemas with JSON-Schema Draft 7 keywords (`$schema`, `additionalProperties`) that caused Bedrock Converse API validation exceptions. We built an automated schema sanitizer that bridges standard MCP tool definitions to Bedrock without breaking spec compliance.
2. **Proactive Triggering in a Gated Preview World:** Since official Alexa+ gated preview SDKs are restricted, we engineered our own interactive Echo Show 15 simulator with native browser voice synthesis and live visual waveform feedback to give judges an authentic, tactile demo.
3. **Multi-Step Latency Optimization:** Sequential tool calling can add seconds of latency. We optimized the MCP executor to parallelize non-dependent tool calls (such as unlocking the smart deadbolt while logging to DynamoDB).

---

### Accomplishments That We're Proud Of
* Built a **100% working, end-to-end fullstack MVP** as a solo developer within 36 hours.
* Fully compliant with the open **Model Context Protocol (MCP)** specification.
* Seamlessly stacked **Primary Track (Alexa+)**, **AWS Builder (Bedrock & DynamoDB)**, and **Open Source** into a single cohesive project.
* Compiled a rigorous, 5-point **Developer Friction Log** with constructive feedback for Amazon's engineering teams.

---

### What We Learned
The Model Context Protocol (MCP) is the missing link that transforms voice assistants into autonomous agents. Designing tool interfaces that provide structured, low-token responses directly enhances model reasoning accuracy and reduces latency in life-critical ambient computing.

---

### What's Next for PulseGuard MCP
* **Physical Hardware Integration:** Pairing with Apple Watch / Bee wearable devices and physical Ring Alarm Pro base stations.
* **FHIR / EHR Interoperability:** Exporting Amazon Bedrock SBAR triage notes directly into Epic / Cerner hospital systems via HL7 FHIR APIs.
* **Multi-Room Echo Show Handoff:** Dynamically routing voice and camera streams based on which room Eleanor is occupying.

---

### Built With
* `amazon-bedrock`
* `amazon-nova-pro`
* `claude-3-5-sonnet`
* `model-context-protocol`
* `alexa-plus`
* `ring-api`
* `typescript`
* `react-19`
* `vite`
* `tailwindcss`
* `express`
* `dynamodb`
