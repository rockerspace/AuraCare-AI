# AuraCare AI

AuraCare AI is an enterprise-grade, predictive health intelligence platform designed for remote patient monitoring. Built entirely on the Google Cloud AI and Data stack, it bridges the gap between modern IoT wearables and legacy hospital Electronic Health Records (EHR) through automated predictive analytics and seamless FHIR integrations.

## 🚀 The AI Moat

Unlike traditional platforms that rely on hardcoded thresholds (e.g., alert if SpO2 < 90), AuraCare AI leverages a proprietary **Predictive Risk Engine**.

By querying real-time time-series data, the engine calculates the mathematical velocity of a patient's vitals. If a subtle degradation trend is detected (e.g., dropping from 98% to 94% rapidly), the AI extrapolates the curve and dispatches an **Early Warning** with a calculated Predictive Risk Score—hours before the patient actually crashes.

## 🏥 Enterprise Architecture

### Google Cloud Infrastructure
- **Serverless Compute**: Next.js application deployed seamlessly on **Google Cloud Run** for infinite horizontal scaling.
- **Relational Database**: Telemetry logged to **Google Cloud SQL (PostgreSQL)**.
- **Enterprise Data Warehousing**: Native integration pathways for **Google BigQuery** to store billions of IoT data points.
- **Dynamic Analytics**: Live data visualization powered by dynamic **Looker Studio** iframes.

### Interoperability & Integration
- **Google Cloud Healthcare API**: AuraCare AI natively translates predictive risk alerts into strict **HL7 FHIR R4** `Observation` payloads. This allows the system to seamlessly push data directly into legacy hospital mainframes like **Epic** and **Cerner** without manual intervention.
- **Real-Time WebSockets**: Powered by **Pusher**, ensuring the Next.js dashboard updates instantly when an anomaly is detected.

## 🛠 Tech Stack
* **Framework**: Next.js 14, React, Tailwind CSS
* **Database / ORM**: Drizzle ORM, PostgreSQL (Google Cloud SQL)
* **Cloud Platform**: Google Cloud (Run, Pub/Sub, Healthcare API, Logging)
* **Authentication**: NextAuth / JWT
* **Real-time**: Pusher WebSockets

## 💻 Local Development

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up your environment variables (`.env.local`):
```env
DATABASE_URL="postgresql://user:pass@localhost/dbname"
IOT_API_KEY="your-secure-iot-key"
PUSHER_APP_ID="your_pusher_app_id"
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your_pusher_cluster"
```

3. Run the development server:
```bash
npm run dev
```

## 📡 Testing the Ingestion Pipeline

You can test the Vertex AI Predictive Engine by sending a sequence of telemetry data that simulates a degrading health event:

```bash
# 1. Normal
curl -X POST http://localhost:3000/api/ingest-vitals -H "Content-Type: application/json" -H "x-api-key: your-secure-iot-key" -d '{"patientId": "1", "heartRate": 75, "spo2": 98, "temp": 98.6}'

# ... send multiple declining requests ...

# 5. The Predictive Trigger
curl -X POST http://localhost:3000/api/ingest-vitals -H "Content-Type: application/json" -H "x-api-key: your-secure-iot-key" -d '{"patientId": "1", "heartRate": 90, "spo2": 94, "temp": 98.6}'
```
