import { NextResponse } from 'next/server';
import { db } from '@/db';
import { vitalsLog, patients } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const { patientId, heartRate, spo2, temp } = data;

    if (!patientId) {
      return NextResponse.json({ error: "patientId is required" }, { status: 400 });
    }

    // 1. Log the new telemetry data to the database
    // (In a true production environment, Drizzle is fully wired up)
    /*
    await db.insert(vitalsLog).values({
      patientId: parseInt(patientId),
      heartRate: parseInt(heartRate),
      spo2: parseInt(spo2),
      temp: parseFloat(temp),
    });
    */

    // 2. Telemetry Analyst Subagent Logic (Basic Anomaly Detection)
    let isCritical = false;
    let alertMessage = "";

    if (spo2 < 90) {
      isCritical = true;
      alertMessage = "Critical: SpO2 dropped below 90%";
    } else if (heartRate > 120 || heartRate < 45) {
      isCritical = true;
      alertMessage = "Critical: Abnormal Heart Rate detected";
    }

    if (isCritical) {
      // Flag patient status in DB
      /*
      await db.update(patients)
        .set({ status: 'critical' })
        .where(eq(patients.id, parseInt(patientId)));
      */
      
      // The Orchestrator would now ping the Communications Manager Subagent to dispatch an SMS
      console.log(`[ORCHESTRATOR] Anomaly detected for Patient ${patientId}: ${alertMessage}`);
    }

    return NextResponse.json({ 
      success: true, 
      recorded: true,
      anomalyDetected: isCritical,
      message: isCritical ? alertMessage : "Vitals stable."
    });

  } catch (error) {
    console.error("IoT Ingestion Error:", error);
    return NextResponse.json({ error: "Failed to ingest telemetry" }, { status: 500 });
  }
}
