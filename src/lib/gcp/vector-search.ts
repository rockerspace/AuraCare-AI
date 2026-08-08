import { db } from './firestore-admin';
import { FieldValue } from 'firebase-admin/firestore';

export class VectorSearchService {
  /**
   * Searches Firestore for similar historical behavioral patterns using Vector Search.
   * This is used by the AI to establish baseline comparisons.
   */
  public async searchHistoricalPatterns(vector: number[]) {
    console.log(`[Firestore Vector] Searching for similar patterns...`);
    
    try {
      // In Firestore, we use findNearest to perform a KNN search.
      // Assumes we have a 'behavioral_patterns' collection with a 'embedding' vector field.
      const coll = db.collection('behavioral_patterns');
      
      const query = coll.findNearest('embedding', FieldValue.vector(vector), {
        limit: 3,
        distanceMeasure: 'COSINE'
      });
      
      const snapshot = await query.get();
      const results = snapshot.docs.map((doc: any) => doc.data());
      
      console.log(`[Firestore Vector] Found ${results.length} similar historical patterns`);
      return results;
    } catch (error: any) {
      console.warn("[Firestore Vector] Index not ready or error searching patterns:", error.message);
      console.warn("[Firestore Vector] Falling back to mock historical baseline until index builds...");
      // Fallback response so the demo doesn't crash while Google Cloud builds the index
      return [
        { label: "Normal Baseline", confidence: 0.95 },
        { label: "Slight Tremor", confidence: 0.12 }
      ];
    }
  }
}

export const vectorSearch = new VectorSearchService();
