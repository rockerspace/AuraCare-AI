/**
 * Explainability Engine
 * 
 * Intercepts safety-critical alerts from the Behavioral Agent (Gemini/Gemma)
 * and generates deterministic, natural language justifications for why the alert
 * was triggered, ensuring transparency for caregivers and auditors.
 */

import { auditLogger } from '../gcp/audit-logger';

export class ExplainabilityEngine {
  /**
   * Generates a human-readable explanation of an AI decision.
   */
  public async generateExplanation(alertType: string, telemetryState: any, aiDecision: string) {
    console.log(`[Explainability Engine] Generating audit justification for ${alertType}`);

    const explanation = `
      ALERT EXPLANATION:
      - Trigger: ${alertType}
      - Patient State: Heart Rate (${telemetryState.heartRate} bpm), Mobility (${telemetryState.mobility}%)
      - AI Decision Logic: The A2A Cloud Agent escalated this due to: "${aiDecision}"
      - Action Taken: Caregiver notified via High Priority Dashboard Alert.
    `;
    
    // Log the explanation to GCP Audit Logs for HIPAA compliance
    await auditLogger.logDataAccess({
      actorDid: "system:explainability-engine",
      action: "AI_QUERY",
      patientId: telemetryState.patientId || "unknown",
      status: "SUCCESS",
      resource: "alert_justification"
    });

    return explanation.trim();
  }
}

export const explainabilityEngine = new ExplainabilityEngine();
