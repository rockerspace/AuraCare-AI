// Model Context Protocol (MCP) Server Configuration
// This allows GADK and Mastra agents to fetch standardized context about the patient.

import { db } from '../gcp/firestore-admin';

export interface PatientContext {
  patientId: string;
  name: string;
  age: number;
  recentNotes: string[];
  baselineMobility: string;
}

export class MCPServer {
  /**
   * Retrieves context for the AI agent using the Model Context Protocol standard.
   */
  public async getContext(patientId: string): Promise<PatientContext> {
    console.log(`[MCP Server] Fetching standard context for patient: ${patientId}`);
    
    try {
      const doc = await db.collection('patients').doc(patientId).get();
      if (!doc.exists) {
        throw new Error(`Patient not found: ${patientId}`);
      }
      return { patientId, ...doc.data() } as PatientContext;
    } catch (error) {
      console.error(`[MCP Server] Error fetching context for ${patientId}:`, error);
      throw error;
    }
  }
  
  /**
   * Extensible A2A (Agent-to-Agent) Protocol Integration
   * Allows Gemini agents to discover and share available tools dynamically.
   */
  public async getAvailableTools(agentId: string) {
    console.log(`[MCP Server] A2A Protocol: Serving available tools to agent ${agentId}`);
    
    return [
      {
        name: 'query_firestore_vector_history',
        description: 'Queries the Firestore vector database for historical behavioral baselines.',
        parameters: { vector: 'array of floats' }
      },
      {
        name: 'verify_enkrypt_session',
        description: 'Validates a decentralized caregiver identity before taking action.',
        parameters: { signature: 'string' }
      }
    ];
  }
}

export const mcpServer = new MCPServer();
