// Enkrypt Authentication Wrapper (Phase 2)
// This simulates integration with Enkrypt for secure, decentralized identity management.

import { ethers } from 'ethers';
import { env } from '../env';

export interface CaregiverSession {
  did: string; // Decentralized ID
  role: 'caregiver' | 'admin' | 'medical_staff';
  permissions: string[];
}

/**
 * Validates an Enkrypt signature against a nonce to authenticate a user.
 */
export async function verifyEnkryptSignature(signature: string, nonce: string): Promise<CaregiverSession | null> {
  if (!signature || !nonce) return null;
  
  try {
    // Recover the address from the signed message (nonce)
    const recoveredAddress = ethers.verifyMessage(nonce, signature);
    
    // In production, we ensure the recovered address matches the authorized caregiver's Enkrypt public key
    const authorizedPublicKey = env.ENKRYPT_PUBLIC_KEY;
    
    if (authorizedPublicKey && recoveredAddress.toLowerCase() === authorizedPublicKey.toLowerCase()) {
      return {
        did: `did:ethr:${recoveredAddress}`,
        role: 'caregiver',
        permissions: ['read:patient_vitals', 'write:care_notes'],
      };
    } else {
      console.error(`[Enkrypt Auth] Unauthorized address: ${recoveredAddress}`);
      return null;
    }
  } catch (error) {
    console.error("[Enkrypt Auth] Signature verification failed:", error);
    return null;
  }
}

/**
 * Generates a challenge nonce for the client to sign using Enkrypt.
 */
export function generateAuthChallenge(): string {
  return `MVP VRN-Auth-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
