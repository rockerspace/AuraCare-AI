const fs = require('fs');
let code = fs.readFileSync('src/app/api/ingest-vitals/route.ts', 'utf8');

// Add the import at the top
code = code.replace(
  "import { sql } from 'drizzle-orm';",
  "import { sql } from 'drizzle-orm';\nimport { pushToFHIR } from '@/lib/fhir-client';"
);

// Find where we log the early warning or critical alert
const target = `    if (isEarlyWarning) {
      console.log(\`[VERTEX AI PREDICTION] Early Warning dispatched for Patient \${patientId} - Risk Score: \${predictiveRiskScore}\`);
    }`;

const replacement = `    if (isEarlyWarning || isCritical) {
      if (isEarlyWarning) {
        console.log(\`[VERTEX AI PREDICTION] Early Warning dispatched for Patient \${patientId} - Risk Score: \${predictiveRiskScore}\`);
      }
      
      // Dispatch HL7 FHIR payload to the Hospital EMR
      await pushToFHIR(
        patientId, 
        { spo2: parseInt(spo2), heartRate: parseInt(heartRate), temp: parseFloat(temp) }, 
        predictiveRiskScore, 
        alertMessage
      );
    }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/app/api/ingest-vitals/route.ts', code);
console.log("FHIR client integrated successfully!");
