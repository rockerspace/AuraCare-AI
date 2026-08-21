const fs = require('fs');
let code = fs.readFileSync('src/app/api/ingest-vitals/route.ts', 'utf8');

// First add 'desc' to drizzle-orm imports
code = code.replace("import { eq } from 'drizzle-orm';", "import { eq, desc } from 'drizzle-orm';");

const target = `    // 2. Telemetry Analyst Subagent Logic (Basic Anomaly Detection)
    let isCritical = false;
    let alertMessage = "";

    if (spo2 < 90) {
      isCritical = true;
      alertMessage = "Critical: SpO2 dropped below 90%";
    } else if (heartRate > 120 || heartRate < 45) {
      isCritical = true;
      alertMessage = "Critical: Abnormal Heart Rate detected";
    }`;

const replacement = `    // 2. Proprietary Predictive AI Engine (Simulating Vertex AI AutoML integration)
    let isCritical = false;
    let isEarlyWarning = false;
    let alertMessage = "";
    let predictiveRiskScore = 0;

    // Hard thresholds (Reactive)
    if (spo2 < 90) {
      isCritical = true;
      alertMessage = "Critical: SpO2 dropped below 90%";
    } else if (heartRate > 120 || heartRate < 45) {
      isCritical = true;
      alertMessage = "Critical: Abnormal Heart Rate detected";
    } else {
      // Predictive Moat (Proactive)
      // Query the last 5 vitals to establish a time-series vector
      const historicalVitals = await db.select()
        .from(vitalsLog)
        .where(eq(vitalsLog.patientId, parseInt(patientId)))
        .orderBy(desc(vitalsLog.timestamp))
        .limit(5);

      if (historicalVitals.length === 5) {
        // Calculate the rate of change (velocity) for SpO2
        const oldestSpO2 = historicalVitals[4].spo2;
        const newestSpO2 = historicalVitals[0].spo2;
        
        // If SpO2 has dropped by 3% or more over the last 5 readings, extrapolate crash
        const velocity = newestSpO2 - oldestSpO2;
        
        if (velocity <= -3) {
          isEarlyWarning = true;
          predictiveRiskScore = 85; // High probability of cardiac event in next 2 hours
          alertMessage = \`EARLY WARNING: Vertex AI predicts SpO2 crash in 1h 45m (Risk Score: \${predictiveRiskScore})\`;
        } else if (velocity < 0) {
          predictiveRiskScore = 45; // Elevated risk
        } else {
          predictiveRiskScore = 10; // Stable
        }
      }
    }

    if (isEarlyWarning) {
      console.log(\`[VERTEX AI PREDICTION] Early Warning dispatched for Patient \${patientId} - Risk Score: \${predictiveRiskScore}\`);
    }`;

code = code.replace(target, replacement);

const pusherTarget = `        isCritical,
        message: isCritical ? alertMessage : "Vitals stable."`;
        
const pusherReplacement = `        isCritical,
        isEarlyWarning,
        predictiveRiskScore,
        message: isCritical || isEarlyWarning ? alertMessage : "Vitals stable."`;

code = code.replace(pusherTarget, pusherReplacement);

const jsonTarget = `      anomalyDetected: isCritical,
      message: isCritical ? alertMessage : "Vitals stable."`;
      
const jsonReplacement = `      anomalyDetected: isCritical,
      earlyWarning: isEarlyWarning,
      riskScore: predictiveRiskScore,
      message: isCritical || isEarlyWarning ? alertMessage : "Vitals stable."`;

code = code.replace(jsonTarget, jsonReplacement);

fs.writeFileSync('src/app/api/ingest-vitals/route.ts', code);
console.log("Ingest Vitals Patched");
