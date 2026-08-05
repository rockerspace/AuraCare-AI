// Model Context Protocol (MCP) Server Configuration
// This allows GADK and Mastra agents to fetch standardized context about the patient.

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
    
    // Mock data for MVP
    return {
      patientId,
      name: 'Jane Doe',
      age: 82,
      recentNotes: [
        'Reported feeling slightly dizzy yesterday morning.',
        'Medication refilled on 3 days ago.',
      ],
      baselineMobility: 'Normal, walks without assistance. 4000 steps/day average.',
    };
  }
}

export const mcpServer = new MCPServer();
