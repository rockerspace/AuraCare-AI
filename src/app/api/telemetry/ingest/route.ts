import { NextResponse } from 'next/server';
import { db } from '@/lib/gcp/firestore-admin';
import { bigQuery } from '@/lib/gcp/bigquery';
import { multiAgentFlow } from '@/lib/agents/gemini-multi-agent';

// Define the expected shape of the IoT Telemetry payload
interface TelemetryPayload {
  patientId: string;
  deviceToken: string;
  heartRate: number;
  mobility: number;
  temperature?: number;
}

export async function POST(request: Request) {
  try {
    const payload: TelemetryPayload = await request.json();

    // 1. Validate Input
    if (!payload.patientId || !payload.deviceToken || payload.heartRate === undefined || payload.mobility === undefined) {
      return NextResponse.json({ error: 'Missing required telemetry fields' }, { status: 400 });
    }

    // 2. Authenticate Device (Option B: Unique device tokens in Firestore)
    const deviceRef = db.collection('devices').doc(payload.deviceToken);
    const deviceDoc = await deviceRef.get();

    if (!deviceDoc.exists) {
      console.error(`[IoT Ingest] Unauthorized device token attempted access: ${payload.deviceToken}`);
      return NextResponse.json({ error: 'Unauthorized device' }, { status: 401 });
    }

    const deviceData = deviceDoc.data();
    if (deviceData?.patientId !== payload.patientId) {
      console.error(`[IoT Ingest] Device token mismatch for patient: ${payload.patientId}`);
      return NextResponse.json({ error: 'Device not assigned to this patient' }, { status: 403 });
    }

    // 3. Stream Data to BigQuery
    const bqRow = {
      patient_id: payload.patientId,
      heart_rate: payload.heartRate,
      mobility: payload.mobility,
      temperature: payload.temperature || null,
      timestamp: new Date().toISOString(),
      event_type: 'IOT_TELEMETRY',
    };

    // We do not wait for BigQuery to finish to respond faster to the IoT device
    // In a high-throughput production environment, this is crucial.
    const bqPromise = bigQuery.streamData([bqRow]).catch(err => {
      console.error('[IoT Ingest] Failed to stream to BigQuery:', err);
    });

    // 4. Trigger Real-Time Agentic Analysis (Gemini 1.5 Pro)
    // We run this asynchronously so the device gets a 200 OK immediately
    const sensorData = [
      { type: 'heart_rate', value: payload.heartRate },
      { type: 'mobility', value: payload.mobility },
      ...(payload.temperature ? [{ type: 'temperature', value: payload.temperature }] : [])
    ];

    const aiPromise = multiAgentFlow.analyzeStream(payload.patientId, sensorData).catch(err => {
      console.error('[IoT Ingest] AI Agent Analysis Failed:', err);
    });

    // Await non-blocking promises if deployed in serverless environments that kill background tasks
    // (For Vercel / Cloud Run, we should await them, or use a proper background job queue like Pub/Sub)
    await Promise.all([bqPromise, aiPromise]);

    return NextResponse.json({ success: true, message: 'Telemetry ingested successfully' }, { status: 200 });

  } catch (error) {
    console.error('[IoT Ingest] Error processing telemetry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
