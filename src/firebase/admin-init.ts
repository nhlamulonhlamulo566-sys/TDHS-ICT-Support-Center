/**
 * @fileOverview Firebase Admin SDK initialization utility
 * Handles both local development (file-based) and production (env-based) credentials
 */

import admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK
 * Supports two credential methods:
 * 1. Production: FIREBASE_ADMIN_SDK_JSON environment variable (base64 or JSON string)
 * 2. Development: GOOGLE_APPLICATION_CREDENTIALS file path
 */
export function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    // Check for environment variable first (Vercel/production)
    const credentialJson = process.env.FIREBASE_ADMIN_SDK_JSON;

    if (credentialJson) {
      let credentials;

      // Try to decode if it's base64
      try {
        const decoded = Buffer.from(credentialJson, 'base64').toString('utf-8');
        credentials = JSON.parse(decoded);
      } catch {
        // If not base64, try to parse directly as JSON
        credentials = JSON.parse(credentialJson);
      }

      return admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
    }

    // Fallback to GOOGLE_APPLICATION_CREDENTIALS (local development)
    return admin.initializeApp();
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw new Error(
      'Firebase Admin SDK initialization failed. Ensure FIREBASE_ADMIN_SDK_JSON environment variable is set in production.'
    );
  }
}

export default admin;
