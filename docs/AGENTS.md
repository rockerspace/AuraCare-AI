# AI Agent Protocols - MVP VRN

MVP VRN uses a robust, production-grade agentic architecture to process IoT streams and trigger real-time actions.

## 1. The Medical Triage Agent (Gemini 1.5 Pro)
The core of our intelligence layer is the Medical Triage Agent, implemented in `src/lib/agents/gemini-multi-agent.ts`.
Unlike a simple rule-based system, this agent evaluates incoming telemetry (heart rate, mobility) from our IoT webhook against historical context fetched via the MCP Server.

## 2. Model Context Protocol (MCP) Server
When the IoT webhook triggers the agent, the Agent first queries the MCP Server (`src/lib/agents/mcp-server.ts`). 
The MCP Server retrieves a patient's exact medical background and past vector search results from Firestore to give the Gemini agent the exact standard of care required to make a decision.

## 3. Agent-to-Agent (A2A) Escalation
Our system simulates a `BehavioralAnalysisAgent` and a `MedicalTriageAgent`. The behavioral agent monitors the high-throughput IoT stream asynchronously from `/api/telemetry/ingest`. When it detects a mathematically significant deviation (e.g. mobility drops 40%), it initiates an A2A protocol payload to escalate the exact subset of anomaly data to the heavier, multimodal Medical Triage Agent for a clinical decision.

This ensures cost-effectiveness (we do not run a massive Gemini 1.5 Pro prompt on every single heartbeat) while preserving emergency safety guarantees.
