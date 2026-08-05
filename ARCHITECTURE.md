# Architecture - AuraCare

AuraCare leverages a modern, serverless Google Tech Stack combined with AI Agent frameworks to provide proactive caregiver support.

## High-Level Architecture Diagram
*(Mermaid Diagram)*

```mermaid
graph TD
    subgraph IoT Ingestion
        S[Sensors / Wearables] -->|Data Stream| API[Next.js API Routes]
    end

    subgraph Security & Access
        Auth[Enkrypt DID] -->|Verification| API
        API -->|HIPAA Logging| Audit[GCP Cloud Audit Logs]
    end

    subgraph AI Intelligence Layer
        API -->|Trigger Analysis| GADK[Google Agent Dev Kit + Mastra]
        GADK <-->|Fetch Context| MCP[MCP Server]
        GADK <-->|Similarity Search| Qdrant[(Qdrant Vector DB)]
    end
    
    subgraph Client Application
        Dashboard[Caregiver Dashboard UI] <-->|Real-time Metrics| API
    end

    subgraph Infrastructure
        CloudRun((GCP Cloud Run))
        CloudRun -.-> API
        CloudRun -.-> GADK
        CloudRun -.-> MCP
    end
```

## Component Breakdown

1.  **Client Application (Next.js):** The frontend caregiver dashboard built with React, Tailwind CSS, and Next.js App Router.
2.  **Security Layer (Enkrypt):** Decentralized Identity (DID) validation via Enkrypt ensures that only authorized medical staff and caregivers can access the system.
3.  **Context Standardization (MCP):** The Model Context Protocol (MCP) server securely formats patient history (age, recent notes) so the AI agent has the full picture before analyzing data.
4.  **AI Orchestration (GADK + Mastra):** The Google Agent Development Kit handles the core reasoning (anomaly detection), while Mastra orchestrates the workflow and triggers emergency protocols.
5.  **Vector Store (Qdrant):** Stores high-dimensional embeddings of a patient's historical behavior. The agent queries Qdrant to understand if current sensor data deviates from the patient's unique baseline.
6.  **Infrastructure (GCP Cloud Run):** Containerized deployment ensuring rapid scalability and HIPAA-eligible serverless execution.
