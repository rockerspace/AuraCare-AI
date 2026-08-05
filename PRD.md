# Product Requirements Document (PRD) - AuraCare

## 1. Product Overview & Problem Statement
Caregivers lack early indicators of behavioral or health changes in elderly family members living alone. By the time a physical SOS button is pressed, it is often too late. AuraCare is a proactive, AI-driven monitoring system that uses ambient IoT sensors and multimodal intelligence (audio/video) to detect subtle deviations in daily routines, vocal biomarkers, and emotional state, alerting caregivers before emergencies occur.

## 2. Target Audience
*   **Primary Users:** Family caregivers and professional medical staff.
*   **Secondary Users:** Elderly individuals living independently (passive users).

## 3. Key Features
*   **Proactive Anomaly Detection:** Utilizes Google Agent Development Kit (GADK) and Mastra to analyze sensor data streams.
*   **Multimodal Intelligence (Voice & Video):** Integrates Smart Cameras to capture spatial audio/video, processed by a Voice AI Service to extract vocal biomarkers, and a Sentiment Analysis Agent to detect distress or confusion.
*   **Vector Baseline Search:** Uses Qdrant to store and compare historical behavioral patterns (e.g., normal morning routine vs. sluggish morning routine).
*   **Context-Aware Alerts:** Leverages Model Context Protocol (MCP) to provide the AI with patient history (recent meds, age, notes) before issuing alerts.
*   **HIPAA Compliant Data Handling:** Strict audit logging for all Protected Health Information (PHI).
*   **Decentralized Identity:** Enkrypt integration for secure caregiver authentication.

## 4. User Journeys
*   **Normal Day:** Caregiver opens the dashboard, sees green indicators for Heart Rate, Sleep, and Mobility.
*   **Anomaly Detected:** The elderly person's mobility drops by 40%. The GADK agent queries Qdrant, determines this is a significant deviation from their specific baseline, and triggers a High Priority Alert to the caregiver's dashboard.

## 5. Non-Functional Requirements
*   **Security:** Enkrypt authentication; End-to-end encryption for IoT data.
*   **Scalability:** Hosted on GCP Cloud Run for serverless, autoscaling performance.
*   **Compliance:** Designed with HIPAA guidelines in mind (Audit logs, Role-Based Access Control).
