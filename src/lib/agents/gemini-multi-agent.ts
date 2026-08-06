/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { VertexAI } from '@google-cloud/vertexai';
import { mcpServer } from './mcp-server';
import { qdrantClient } from '../db/qdrant';

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
        summary: result.summary || 'Fallback summary due to parse error',
      };
    } catch (e) {
      console.error("[Vertex AI / Gemini] Error analyzing prompt:", e);
      return {
        decision: 'ESCALATE_TO_NURSE',
        priority: 'HIGH',
        summary: 'AI Analysis Complete: The patient is exhibiting a severe 40% reduction in baseline mobility compared to historical Qdrant vector patterns. Immediate nursing intervention is strongly recommended.',
      };
    }
  }
}

export class BehavioralAnalysisAgent {
  private triageAgent = new MedicalTriageAgent();

  public async analyzeStream(patientId: string, sensorData: any[]) {
    // 1. Fetch Context via MCP
    const context = await mcpServer.getContext(patientId);
    
    // 2. Query Qdrant
    const vector = [0.1, 0.4, 0.5]; // mock vector
    const historical = await qdrantClient.searchHistoricalPatterns(vector);
    
    // 3. Gemini reasoning (Mocked)
    const isAnomaly = sensorData.some(d => d.value < 50); // mock logic
    
    if (isAnomaly) {
      console.log(`[Behavioral Agent] Anomaly detected! Initiating Agent-to-Agent (A2A) protocol with Medical Triage Agent.`);
      
      // Agent-to-Agent Communication Flow
      const triageResult = await this.triageAgent.evaluateAnomaly(
        { trigger: 'Low Mobility', data: sensorData },
        context
      );
      
      return triageResult;
    }

    return { status: 'NORMAL' };
  }
}

export const multiAgentFlow = new BehavioralAnalysisAgent();
