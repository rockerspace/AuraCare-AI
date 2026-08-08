/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { VertexAI } from '@google-cloud/vertexai';
import { mcpServer } from './mcp-server';
import { vectorSearch } from '../gcp/vector-search';

// Initialize Vertex AI with the actual project
const vertexAi = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'vemarai',
  location: process.env.GCP_REGION || 'us-central1'
});

// Use Gemini 1.5 Pro for advanced medical reasoning
const generativeModel = vertexAi.getGenerativeModel({
  model: 'gemini-1.5-pro',
});

export class MedicalTriageAgent {
  public async evaluateAnomaly(anomalyData: any, patientContext: any) {
    console.log(`[Triage Agent] Evaluating anomaly for ${patientContext.name}...`);
    
    const prompt = `
      You are an expert Medical Triage Agent analyzing an IoT anomaly for an elderly patient.
      Patient Context: ${JSON.stringify(patientContext)}
      Anomaly Data: ${JSON.stringify(anomalyData)}
      
      Respond with ONLY a valid JSON object matching this schema, no markdown blocks:
      {
        "decision": "ESCALATE_TO_NURSE" | "MONITOR_LOCALLY" | "DISMISS",
        "priority": "HIGH" | "MEDIUM" | "LOW",
        "summary": "String explaining your reasoning"
      }
    `;
    
    console.log(`[Vertex AI / Gemini] Analyzing prompt using real Gemini 1.5 Pro model...`);
    
    try {
      const resp = await generativeModel.generateContent(prompt);
      const text = resp.response.candidates?.[0].content.parts[0].text || "{}";
      
      // Clean up markdown in case it was returned
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanText);
      
      return {
        decision: result.decision || 'ESCALATE_TO_NURSE',
        priority: result.priority || 'HIGH',
        summary: result.summary || 'Summary unavailable',
      };
    } catch (e) {
      console.error("[Vertex AI / Gemini] Error analyzing prompt:", e);
      // In production, we do not swallow AI failures. Escalate immediately!
      throw new Error(`AI Triage Failed: ${e instanceof Error ? e.message : 'Unknown Error'}`);
    }
  }
}

export class BehavioralAnalysisAgent {
  private triageAgent = new MedicalTriageAgent();

  public async analyzeStream(patientId: string, sensorData: any[]) {
    // 1. Fetch Context via MCP
    const context = await mcpServer.getContext(patientId);
    
    // 2. Query Firestore Vector Search
    // Simulate converting sensor data into an embedding (mocking embedding step, but querying real DB)
    const vector = [0.1, 0.4, 0.5]; 
    const historical = await vectorSearch.searchHistoricalPatterns(vector);
    
    // 3. Gemini reasoning for behavioral anomaly detection
    const prompt = `
      You are an expert Behavioral Analysis Agent monitoring elderly patient telemetry.
      Patient Context: ${JSON.stringify(context)}
      Historical Patterns: ${JSON.stringify(historical)}
      Live Sensor Data: ${JSON.stringify(sensorData)}
      
      Determine if the live sensor data represents a significant anomaly compared to historical patterns.
      Respond with ONLY a valid JSON object:
      {
        "isAnomaly": boolean,
        "reasoning": "String explanation"
      }
    `;
    
    let isAnomaly = false;
    let anomalyData = null;
    
    try {
      console.log(`[Behavioral Agent] Analyzing telemetry for ${context.name}...`);
      const resp = await generativeModel.generateContent(prompt);
      const text = resp.response.candidates?.[0].content.parts[0].text || "{}";
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanText);
      
      isAnomaly = result.isAnomaly;
      anomalyData = { trigger: result.reasoning, data: sensorData };
    } catch (e) {
      console.error("[Behavioral Agent] Analysis failed, defaulting to cautious escalation", e);
      isAnomaly = true;
      anomalyData = { trigger: "Analysis failed, initiating failsafe escalation", data: sensorData };
    }
    
    if (isAnomaly) {
      console.log(`[Behavioral Agent] Anomaly detected! Initiating Agent-to-Agent (A2A) protocol with Medical Triage Agent.`);
      
      // Agent-to-Agent Communication Flow
      const triageResult = await this.triageAgent.evaluateAnomaly(
        anomalyData,
        context
      );
      
      return triageResult;
    }

    return { status: 'NORMAL' };
  }
}

export const multiAgentFlow = new BehavioralAnalysisAgent();
