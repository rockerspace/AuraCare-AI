/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { bigQuery } from '@/lib/gcp/bigquery';

export async function logTelemetryToBigQuery(patientId: string, eventType: string) {
  try {
    const row = {
      patient_id: patientId,
      heart_rate: Math.floor(Math.random() * (120 - 60 + 1)) + 60,
      mobility: Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString(),
      event_type: eventType,
    };
    
    await bigQuery.streamData([row]);
    return { success: true };
  } catch (error) {
    console.error("Failed to log telemetry to BigQuery via Server Action:", error);
    return { success: false, error: String(error) };
  }
}

import { multiAgentFlow } from '@/lib/agents/gemini-multi-agent';

export async function runVertexAITriage(patientId: string, sensorData: any[]) {
  try {
    const result = await multiAgentFlow.analyzeStream(patientId, sensorData);
    return { success: true, result };
  } catch (error) {
    console.error("Failed to run Vertex AI Triage via Server Action:", error);
    return { success: false, error: String(error) };
  }
}
