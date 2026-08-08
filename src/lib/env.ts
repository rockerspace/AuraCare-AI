import { z } from 'zod';

// Client-side environment variables (safe to expose to browser)
const clientSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().default('demo-key'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().default('demo-domain'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().default('demo-project'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
});

// Server-side environment variables (secrets)
const serverSchema = z.object({
  GCP_PROJECT_ID: z.string().default('demo-project'),
  GCP_REGION: z.string().default('us-central1'),
  ENKRYPT_PUBLIC_KEY: z.string().optional(),
});

// Parse client envs unconditionally
const parsedClientEnv = clientSchema.parse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

// Parse server envs only if we are on the server
const isServer = typeof window === 'undefined';

const parsedServerEnv = isServer 
  ? serverSchema.parse({
      GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
      GCP_REGION: process.env.GCP_REGION,
      ENKRYPT_PUBLIC_KEY: process.env.ENKRYPT_PUBLIC_KEY,
    }) 
  : { 
      // Dummy values on the client to satisfy types (they won't be used)
      GCP_PROJECT_ID: '', 
      GCP_REGION: '', 
      ENKRYPT_PUBLIC_KEY: '' 
    };

export const env = {
  ...parsedClientEnv,
  ...parsedServerEnv,
};
