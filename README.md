# AuraCare AI - Proactive Caregiving App

A real-time, enterprise-grade Caregiving Dashboard built for Care Home Directors and Nurses. This platform centralizes patient vitals, automates family follow-ups via AI, and acts as a single pane of glass for hardware integrations.

**🔴 Live Beta Environment:** [https://ai-agent-series-builder-finale-2026-805096709254.us-central1.run.app](https://ai-agent-series-builder-finale-2026-805096709254.us-central1.run.app)

## 🚀 Key Features

*   **Custom OTP Authentication:** International SMS/Email passwordless login (🇺🇸, 🇬🇧, 🇮🇳, etc.) built natively without heavy third-party auth lock-in.
*   **Real-time Vitals Command Center:** A sleek dark-mode dashboard to monitor patient heart rate, SpO2, and temperature with **real-time auto-polling**.
*   **Twilio SMS Integration ("Follow up"):** A fully integrated Twilio backend allowing Caregivers to trigger instant, AI-summarized text messages to a patient's emergency contacts.
*   **Cryptographic Webhook Security:** Fully secured inbound SMS webhooks validating X-Twilio-Signature to prevent spoofing.
*   **Spatial Room View:** A Nurses Station interface mapping physical facility rooms, highlighting critical alerts in red and identifying empty rooms ready for admission.
*   **Autonomous AI Executive Team:** A built-in multi-agent system featuring a CTO Agent, Product Agent, Growth Agent, and QA Agent that perform automated 7:00 AM daily standups, E2E testing, and weekly Friday scaling reports.
*   **Family Communications Hub:** A dedicated inbox to monitor automated AI updates and reply to family members directly via SMS.
*   **Looker Studio Integration:** An enterprise analytics tab built to natively embed Google BigQuery Looker Studio reports.
*   **Global Security Standards:** Designed with compliance in mind (HIPAA, SOC 2 Type II, GDPR, ISO 27001) and WCAG AA contrast accessibility.
*   **Enterprise-Grade Security:** Field-level encryption for Patient Health Information (PHI) in PostgreSQL via Drizzle ORM, ensuring strict HIPAA compliance.
*   **IoT API Authentication:** Secure IoT telemetry ingestion endpoints requiring robust API Keys.
*   **Distributed Rate Limiting:** Database-backed distributed rate limiting for API routes, protecting against DDoS attacks in Serverless and Cloud Run environments.
*   **Serverless Database Scaling:** Connection pooling limits established in `pg` to prevent Cloud SQL connection exhaustion during massive horizontally scaled traffic spikes.
## 🧠 Google AI-First Tech Stack

Our entire architecture is deeply integrated into the Google Cloud ecosystem, prioritizing autonomous AI agents, massive event streaming, and edge hardware capabilities.

*   **Event Bus (IoT Telemetry):** Google Cloud Pub/Sub (Massive horizontal scale for SpO2 anomaly detection)
*   **Hardware Architecture:** Google ADK (Accessory Development Kit) for Android-based edge compute
*   **Database:** Google Cloud SQL (PostgreSQL)
*   **Enterprise Analytics:** Google Looker Studio & BigQuery
*   **Compute:** Google Cloud Run (Dockerized Next.js)
*   **AI Workforce:** A fully autonomous 18-agent organizational structure (CTO, CLO, CMO, CFO, CHRO)
## 🛠 Base Framework

*   **Framework:** Next.js 14 (App Router) on Google Cloud Run Docker
*   **Language:** TypeScript
*   **Database:** Google Cloud SQL (PostgreSQL) + Drizzle ORM
*   **Styling:** Tailwind CSS + Framer Motion (for fluid, glassmorphic UI)
*   **Event Bus:** Google Cloud Pub/Sub
*   **Communications API:** Twilio (Node.js SDK)
*   **Analytics:** Looker Studio Iframes

## 📦 Local Development

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure your environment variables. Create a .env.local file:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   DATABASE_URL=postgresql://postgres:password@your_google_cloud_ip:5432/postgres
   ```

3. Push the database schema:
   ```bash
   npx drizzle-kit push
   ```

4. Start the Turbopack development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤖 AI Multi-Agent Testing Suite
To simulate the background QA Agent locally, run the included test-local.sh script to verify webhook security and IoT anomaly detection.

## 💼 Business Strategy & Monetization
This application was architected specifically for B2B SaaS sales to Care Home facilities. The UI emphasizes automation (reducing nurse workload) and family communication (increasing facility reputation and client retention).

*Built for global scale.*
