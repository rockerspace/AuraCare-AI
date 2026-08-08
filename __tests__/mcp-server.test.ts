import { mcpServer } from '../src/lib/agents/mcp-server';

jest.mock('../src/lib/gcp/firestore-admin', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ 
      exists: true, 
      data: () => ({ 
        patientId: 'patient-123', 
        name: 'Jane Doe',
        age: 82,
        recentNotes: ['Reported feeling slightly dizzy yesterday morning.', 'Medication refilled on 3 days ago.'],
        baselineMobility: 'Normal, walks without assistance. 4000 steps/day average.'
      }) 
    })
  }
}));

describe('MCP Server (Model Context Protocol)', () => {
  it('should return standardized patient context', async () => {
    const context = await mcpServer.getContext('patient-123');
    
    expect(context).toBeDefined();
    expect(context.patientId).toBe('patient-123');
    expect(context.name).toBe('Jane Doe');
    expect(context.age).toBe(82);
    expect(Array.isArray(context.recentNotes)).toBe(true);
    expect(context.baselineMobility).toContain('4000 steps/day');
  });

  it('should return available tools for agents via A2A protocol', async () => {
    const tools = await mcpServer.getAvailableTools('agent-456');
    
    expect(tools).toBeDefined();
    expect(tools.length).toBeGreaterThan(0);
    expect(tools[0].name).toBe('query_firestore_vector_history');
    expect(tools[1].name).toBe('verify_enkrypt_session');
  });
});
