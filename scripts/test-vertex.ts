import { vertexAgent } from './src/lib/gcp/vertex-agent';

/**
 * A quick local test script to verify the Vertex AI (Gemini 1.5 Pro) connection.
 * 
 * Instructions to run:
 * 1. Authenticate with Google Cloud: `gcloud auth application-default login`
 * 2. Set Project ID: `gcloud config set project vemarai`
 * 3. Install SDK: `npm install @google-cloud/vertexai`
 * 4. Run this script: `npx ts-node test-vertex.ts`
 */
async function runTest() {
  console.log("🚀 Starting Vertex AI local test against project: vemarai...");
  
  try {
    // In a real scenario, this URI would point to a video file in a Cloud Storage Bucket
    // e.g. 'gs://vemarai-bucket/sample-video.mp4'
    const mockVideoUri = 'gs://github-repo/sample-video.mp4'; 
    const prompt = 'Analyze the subject in this video segment for any signs of physical distress or fall risks.';
    
    console.log(`Sending prompt: "${prompt}"`);
    const result = await vertexAgent.analyzeVideoSegment(mockVideoUri, prompt);
    
    console.log("✅ Vertex AI Response Received:");
    console.log(result.analysis);
  } catch (error) {
    console.error("❌ Test Failed:");
    console.error(error);
  }
}

runTest();
