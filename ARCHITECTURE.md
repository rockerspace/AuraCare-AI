# Architecture - AuraCare

AuraCare leverages a modern, serverless Google Tech Stack combined with AI Agent frameworks to provide proactive caregiver support.

## High-Level Architecture Diagram
*(Mermaid Diagram)*

```mermaid
graph TD
    subgraph IoT Edge Gateway (Local Home)
        S[Sensors / Wearables] -->|Telemetry| Gemma[Gemma 2B - Local Behavioral Agent]
        Cam[Smart Camera] -->|WebRTC Video & Spatial Audio| Gemma
        SOS[Hardware SOS Panic Button] -->|Instant Trigger| A2A
        Gemma -->|Offline Baseline & Anomaly Check| A2A[A2A Coordinator]
    end

    subgraph Security & Access
        Auth[Enkrypt DID] -->|Verification| API
        API[Next.js API Routes / Cloud Run] -->|HIPAA Logging| Audit[GCP Cloud Audit Logs]
    end

    subgraph Data & Analytics (Google Cloud)
        API -->|Stream Sensor Data| BQ[(BigQuery)]
        Qdrant[(Qdrant Vector DB)]
    end

    subgraph AI Intelligence Layer (Cloud)
        A2A -->|Escalate Anomaly| MCP[MCP Server - Context Standardization]
        MCP -->|Fetch Patient History| ADK[Agent Development Kit Orchestrator]
        ADK -->|Video/Audio Analytics| Vertex[Gemini 1.5 Pro via Vertex AI & AI Studio]
        Vertex -->|Explainable Alert| Explain[Explainability Engine]
        Explain -->|Trigger Real-Time Emergency Escalation| API
    end
    
    subgraph Observability
        Vertex -->|Token/Latency Metrics| OTel[OpenTelemetry LLM Tracer]
    end
    
    subgraph Client Application
        Dashboard[Caregiver Dashboard UI] <-->|Real-time Metrics| API
        Dashboard <-->|Family Chat & Collaboration| API
    end
```

## Component Breakdown (Mandatory Hackathon Stack)

1.  **Gemma 2B (Edge Processing):** Runs locally on the home IoT gateway to analyze real-time telemetry from wearables, preserving privacy and ensuring offline functionality for baseline monitoring.
2.  **WebRTC & Spatial Audio Ingestion:** Secure, low-latency WebRTC pipelines stream live video and spatial audio from IoT cameras directly into the edge and cloud processing layers for immediate context.
2.  **ADK, MCP, and A2A Protocols:** 
    - The **Agent-to-Agent (A2A)** protocol manages the handoff between the local Gemma edge agent and the cloud-based Gemini agents.
    - The **Model Context Protocol (MCP)** securely formats and standardizes patient history before sending it to the cloud.
    - The **Agent Development Kit (ADK)** and **Antigravity** toolchains orchestrate these workflows.
4.  **Vertex AI & Google AI Studio (Gemini 1.5 Pro):** Replaces generic ML pipelines. Handles complex multimodal reasoning (analyzing WebRTC video feeds and spatial audio sentiment) when escalated by the edge agent. Includes dedicated **Voice AI** and **Sentiment Analysis** modules.
5.  **Real-Time Emergency Escalation & SOS Button:** If severe distress (e.g., a fall) is detected, or the **SOS Panic Button** is pressed, the A2A Coordinator bypasses standard polling and triggers an instant emergency escalation via Cloud Run, notifying caregivers and the **Family Chat** thread immediately.
4.  **BigQuery (Analytics):** Ingests all historical IoT telemetry and alert data for long-term trend analysis and dashboard querying.
5.  **OpenTelemetry (LLM Observability):** Traces all LLM calls to Gemini and Gemma, logging token usage, prompt hashes, and latency metrics for safety-critical monitoring.
6.  **Explainability Engine:** Sits between the AI reasoning and the user dashboard, translating probabilistic LLM outputs into deterministic, natural-language justifications for why an emergency alert was triggered.
7.  **Infrastructure (GCP Cloud Run):** Containerized deployment ensuring rapid scalability and HIPAA-eligible serverless execution for the API and agent orchestrators.
