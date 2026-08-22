import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return NextResponse.json({ 
    error: "DEPRECATED: IoT Telemetry has been migrated to the MQTT + BigQuery pipeline. HTTP ingestion is disabled to preserve database stability." 
  }, { status: 410 });
}
