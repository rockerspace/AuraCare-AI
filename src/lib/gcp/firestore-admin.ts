import { env } from '../env';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  try {
    initializeApp({
      projectId: env.GCP_PROJECT_ID,
      // In production, we rely on Application Default Credentials (ADC) or a service account key
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const db = getFirestore();
