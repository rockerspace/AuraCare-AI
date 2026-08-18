import { MedicalTriageAgent } from '../../src/lib/agents/gemini-multi-agent';
import { logTelemetryToBigQuery } from '../../src/app/actions';
import { bigQuery } from '../../src/lib/gcp/bigquery';

jest.mock('../../src/lib/gcp/bigquery', () => ({
  bigQuery: {
    streamData: jest.fn().mockResolvedValue({}),
    getAverageHeartRate: jest.fn().mockResolvedValue(75)
  }
}));

jest.mock('../../src/lib/gcp/firestore-admin', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ patientId: 'patient_01', name: 'Jane Doe' }) })
  }
}));

// We want to test MedicalTriageAgent's fallback.
// MedicalTriageAgent uses generativeModel internally. 
// Instead of mocking the whole file, we can test what it outputs when Vertex AI throws an error.
// We'll simulate Vertex AI throwing an error by mocking VertexAI module entirely.
jest.mock('@google-cloud/vertexai', () => {
  return {
    VertexAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockRejectedValue(new Error('Quota exceeded for Vertex AI'))
      })
    }))
  };
});

describe('Cloud Services Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('BigQuery Analytics', () => {
    it('should attempt to write SOS events to BigQuery', async () => {
      const result = await logTelemetryToBigQuery('patient_01', 'SOS_PANIC_TRIGGERED');
      
      expect(result.success).toBe(true);
      expect(bigQuery.streamData).toHaveBeenCalled();
    });
  });

  describe('Vertex AI Agent Fallback', () => {
    it('should fallback to deterministic JSON when Vertex AI API fails', async () => {
      const triageAgent = new MedicalTriageAgent();
      
      // Triage Agent is now expected to throw the error immediately so engineering can be paged
      await expect(triageAgent.evaluateAnomaly(
        { trigger: 'Heart Rate Spike' },
        { patientId: 'patient_01', name: 'Jane Doe' }
      ))).resolves.toHaveProperty("decision", "ESCALATE_TO_NURSE");
    });
  });
});
