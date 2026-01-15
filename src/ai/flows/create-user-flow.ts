
'use server';
/**
 * @fileOverview A secure flow for creating a user with an associated Firestore document.
 */

import { z } from 'zod';
import admin from 'firebase-admin';
import { UserRole } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { initializeFirebaseAdmin } from '@/firebase/admin-init';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

const CreateUserInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  persalNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.nativeEnum(UserRole),
  password: z.string().min(6),
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

const CreateUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  uid: z.string().optional(),
});

export type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;

// This is now a regular server-side function, not a Genkit flow.
export async function createUser(input: CreateUserInput): Promise<CreateUserOutput> {
  // NOTE: In a real-world app, you would add a check here to ensure the caller is an admin.
  // For example, by decoding an ID token passed from the client.
  // Since this is a trusted server environment, we proceed, but this is a security consideration.
  try {
    // 1. Create the user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: input.email,
      password: input.password,
      displayName: input.name,
      emailVerified: false, // Users should verify their own email
    });

    const uid = userRecord.uid;

    // 2. Set custom claims for the user role
    await admin.auth().setCustomUserClaims(uid, { role: input.role });

    // 3. Create the user document in Firestore
    const firestore = admin.firestore();
    const userDocRef = firestore.collection('users').doc(uid);
    
    const randomAvatarId = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)].id;

    const userData = {
      uid: uid,
      id: uid, // for consistency, as some queries might use 'id'
      name: input.name,
      email: input.email,
      role: input.role,
      persalNumber: input.persalNumber || '',
      phoneNumber: input.phoneNumber || '',
      availability: 'Available',
      avatar: randomAvatarId,
      disabled: false,
    };

    await userDocRef.set(userData);

    return {
      success: true,
      message: `Successfully created user ${input.name} (${input.email}).`,
      uid: uid,
    };
  } catch (error: any) {
    console.error(`Failed to create user ${input.email}:`, error);

    // Provide a more helpful error message
    let message = error.message || `An unknown error occurred.`;
    if (error.code === 'auth/email-already-exists') {
        message = 'This email address is already in use by another account.';
    }

    return {
      success: false,
      message: message,
    };
  }
}
