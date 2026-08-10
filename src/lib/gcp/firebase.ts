import { initializeApp, getApps } from "firebase/app";
import { getAuth, ConfirmationResult } from "firebase/auth";

import { env } from '../env';

// Replace these with your actual Firebase config from Google Cloud Console
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
import { getFirestore } from "firebase/firestore";
export const db = getFirestore(app);

// Helper for hackathon: since we don't have real credentials, we expose types here
export type { ConfirmationResult };
