import { multiAgentFlow, MedicalTriageAgent } from '../../src/lib/agents/gemini-multi-agent';

// Mock MCP Server
jest.mock('../../src/lib/agents/mcp-server', () => ({
  mcpServer: {
    getContext: jest.fn().mockResolvedValue({
      patientId: 'patient_01',
      name: 'Jane Doe'
    })
  }
}));

// Mock Vector Search
jest.mock('../../src/lib/gcp/vector-search', () => ({
  vectorSearch: {
    searchHistoricalPatterns: jest.fn().mockResolvedValue([])
  }
}));

// Mock Vertex AI behavior to return controlled LLM responses
jest.mock('@google-cloud/vertexai', () => {
  return {
    VertexAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn((prompt: string) => {
          // If the prompt mentions 80, we consider it normal
          if (prompt.includes('80')) {
            return Promise.resolve({
              response: { candidates: [{ content: { parts: [{ text: JSON.stringify({ isAnomaly: false }) }] } }] }
            });
          }
          // Otherwise, it's an anomaly
          return Promise.resolve({
            response: { candidates: [{ content: { parts: [{ text: JSON.stringify({ isAnomaly: true, reasoning: 'Low Mobility' }) }] } }] }
          });
        })
      })
    }))
  };
});

// Mock the triage agent so we don't actually hit Vertex AI during this local integration test,
// but we CAN spy on it to ensure A2A escalation happens correctly.
jest.mock('../../src/lib/agents/gemini-multi-agent', () => {
  const originalModule = jest.requireActual('../../src/lib/agents/gemini-multi-agent');
  
  // Mock evaluateAnomaly to just return a deterministic payload
  originalModule.MedicalTriageAgent.prototype.evaluateAnomaly = jest.fn().mockResolvedValue({
    decision: 'ESCALATE_TO_NURSE',
    priority: 'HIGH',
    summary: 'Mocked AI Analysis Complete'
  });
  
  return originalModule;
});

describe('Agent-to-Agent (A2A) Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should bypass the Triage Agent when sensor data is normal', async () => {
    // Sensor data > 50 is considered normal in the mock logic
    const normalSensorData = [{ value: 80, type: 'mobility' }];
    
    const result = await multiAgentFlow.analyzeStream('patient_01', normalSensorData);
    
    expect(result).toEqual({ status: 'NORMAL' });
    
    // Ensure MedicalTriageAgent was NEVER called
    expect(MedicalTriageAgent.prototype.evaluateAnomaly).not.toHaveBeenCalled();
  });

  it('should escalate to MedicalTriageAgent when anomaly is detected', async () => {
    // Sensor data < 50 is an anomaly in the mock logic
    const anomalySensorData = [{ value: 30, type: 'mobility' }];
    
    const result = await multiAgentFlow.analyzeStream('patient_01', anomalySensorData);
    
    // Ensure the A2A escalation happened
    expect(MedicalTriageAgent.prototype.evaluateAnomaly).toHaveBeenCalledTimes(1);
    
    // Verify context was passed correctly during escalation
    expect(MedicalTriageAgent.prototype.evaluateAnomaly).toHaveBeenCalledWith(
      { trigger: 'Low Mobility', data: anomalySensorData },
      expect.objectContaining({
        patientId: 'patient_01',
        name: 'Jane Doe'
      })
    );
    
    // Ensure we receive the payload from the Triage Agent
    expect(result).toEqual({
      decision: 'ESCALATE_TO_NURSE',
      priority: 'HIGH',
      summary: 'Mocked AI Analysis Complete'
    });
  });
});
