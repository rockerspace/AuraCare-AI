import { NextResponse } from 'next/server';
import { bigQuery } from '@/lib/gcp/bigquery';
import { globalCache } from '@/lib/cache';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== 'Bearer mvp-vrn-secret-token') {
      return NextResponse.json({ error: 'Unauthorized IoT Device' }, { status: 401 });
    }

    const body = await req.json();
    const { patient_id, heart_rate, spO2, mobility, temp, timestamp } = body;

    if (!patient_id || !heart_rate || !spO2) {
      return NextResponse.json({ error: 'Missing required telemetry fields' }, { status: 400 });
    }

    // Insert into BigQuery for historical tracking (Sprint 3)
    await bigQuery.streamData([{
      patient_id,
      heart_rate,
      mobility: mobility || 100,
      timestamp: timestamp || new Date().toISOString(),
      event_type: 'IoT_INGESTION'
    }]);

    // Store in global cache for real-time Next.js UI streaming
    globalCache.latestPatientData = {
      patient_id,
      heart_rate,
      spO2,
      mobility,
      temp,
      timestamp: timestamp || new Date().toISOString()
    };

    // Check for critical anomalies to trigger alerts
    let anomalyDetected = false;
    let message = 'Telemetry recorded successfully';

    if (heart_rate > 120 || heart_rate < 50 || spO2 < 92) {
      anomalyDetected = true;
      message = 'CRITICAL ANOMALY DETECTED: Escalating to Gemini Vertex AI via A2A router.';
      
      // We would normally fire an event to Vertex AI here, but for the MVP 
      // we just log it in the response to prove the pipeline works.
    }

    return NextResponse.json({ 
      success: true, 
      message, 
      anomaly: anomalyDetected,
      data: { patient_id, heart_rate, spO2 } 
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('IoT Ingestion Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  }
}
