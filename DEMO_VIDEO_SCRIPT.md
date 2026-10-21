# PulseGuard MCP — 2.5-Minute Winning Video Demo Script
> **Target Duration:** 2 minutes 15 seconds to 2 minutes 30 seconds (Devpost requires < 3 minutes)  
> **Tools Recommended:** Loom, OBS Studio, or QuickTime Screen Recorder  
> **Audio:** Ensure your system audio / microphone is active so viewers can hear both your voice and the synthesized Alexa voice!

---

### [0:00 - 0:25] Scene 1: The Problem & The Hook
* **Visual:** Face on camera or screen showing the PulseGuard MCP dashboard in peaceful baseline mode.
* **Narration:**
  > "Hi everyone, I’m participating as a solo developer in the 2026 Amazon Developer Hackathon: Build, Ship, Shape. 
  > Over 50 million seniors live independently today, and millions of homes have an Echo Show or a Ring Doorbell. 
  > But traditional voice assistants have one fatal flaw: **they are completely passive**. 
  > If an elderly parent falls, experiences heart failure, or misses a vital medication, Alexa does nothing until someone speaks. 
  > Today, I’m proud to introduce **PulseGuard MCP** — an autonomous ambient healthcare copilot powered by **Alexa+** and the **Model Context Protocol (MCP)**."

---

### [0:25 - 0:50] Scene 2: Architecture & The Model Context Protocol
* **Visual:** Point mouse to the **MCP Tool Inspector** (right panel) and the registered tool list.
* **Narration:**
  > "PulseGuard MCP implements an open-standard MCP server running over Server-Sent Events. 
  > Instead of a simple chatbot, our Alexa+ agent—powered by **Amazon Bedrock Nova Pro**—has direct access to five clinical and smart home tools: 
  > reading patient vitals, checking smart pill dispensers, controlling Ring smart locks and video feeds, dispatching emergency escalations, and logging immutable audits to Amazon DynamoDB."

---

### [0:50 - 1:35] Scene 3: The Live Demo (Scenario 1: Critical Fall)
* **Visual:** Click the red **"1. Fall with Tachycardia"** button on the bottom scenario deck.
* **Action:**
  * Watch the Echo Show screen immediately transition to high-priority RED Emergency Triage mode.
  * Listen to the synthesized Alexa voice speak: *"Eleanor, I detected a hard fall and noticed your heart rate is rapid..."*
  * Look at the right panel showing the step-by-step MCP tool calls:
    1. `mcp::get_patient_vitals_telemetry()`
    2. `mcp::dispatch_emergency_escalation()`
    3. `mcp::control_ring_security(unlock_smart_deadbolt)`
    4. `mcp::record_care_event_log()`
  * Point out the Ring smart deadbolt changing to **UNLOCKED (Code: 9217)**.
* **Narration:**
  > "Let’s watch what happens when an emergency occurs. Eleanor experiences a 3.85G fall in the hallway, and her heart rate spikes to 142 bpm. 
  > Instantly, Alexa+ perceives the anomaly. Through MCP, it queries telemetry, realizes Eleanor is immobilized with tachycardia, and takes action: 
  > It calms Eleanor over the Echo Show 15 speaker, stages an EMT handoff with an SBAR report, alerts her daughter Sarah via AWS SNS, and automatically unlocks the Ring Smart Deadbolt so paramedics don’t have to break down the front door. 
  > Every single action is tracked in the reasoning trace right here in real time."

---

### [1:35 - 2:05] Scene 4: Ring Doorbell Integration & Medication Adherence
* **Visual:** Click **"3. First Responders at Ring Cam"** to show the Ring live video stream and intercom.
* **Narration:**
  > "When first responders arrive, the Ring Video Doorbell Pro verifies their presence. PulseGuard MCP broadcasts entry clearance over the Ring intercom and displays the live feed on the Echo Show. 
  > PulseGuard also handles preventative care: if Eleanor misses her critical blood thinner, Alexa+ cross-references her blood pressure, highlights the exact dispenser slot on the screen, and gently prompts her."

---

### [2:05 - 2:30] Scene 5: Developer Friction Log & Conclusion
* **Visual:** Quick switch to the `FRICTION_LOG.md` file in the GitHub repo / IDE, showing the 5 detailed entries.
* **Narration:**
  > "Because this hackathon is about shaping the future of Amazon's developer platform, I’ve also submitted a comprehensive **Developer Friction Log** covering Bedrock Converse schema validation, MCP tool serialization, and latency optimizations. 
  > PulseGuard MCP proves that by marrying **Alexa+** with the **Model Context Protocol** and **AWS cloud infrastructure**, we can transform smart homes from passive gadgets into proactive, life-saving ambient guardians. 
  > Thank you!"

---

### Recording Tips for Success:
1. **Rehearse once:** Click through the 4 buttons once before recording so you're familiar with the timing.
2. **Resolution:** 1080p full screen is ideal.
3. **Keep pacing crisp:** Stick to ~2:20 to stay safely below the 3:00 minute hard limit!
