
'use server';
/**
 * @fileOverview A secure flow for disabling or enabling a user account.
 */

import { z } from 'zod';
import admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '@/firebase/admin-init';
import { UserRole } from '@/lib/types';

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

const DisableUserInputSchema = z.object({
  uid: z.string().min(1, { message: "User ID is required." }),
  disable: z.boolean(),
});

export type DisableUserInput = z.infer<typeof DisableUserInputSchema>;

const DisableUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type DisableUserOutput = z.infer<typeof DisableUserOutputSchema>;

// This is now a regular server-side function, not a Genkit flow.
export async function disableUser({ uid, disable }: DisableUserInput): Promise<DisableUserOutput> {
  // NOTE: Add admin verification here in a real app.
  const action = disable ? 'disable' : 'enable';
  const pastTenseAction = disable ? 'disabled' : 'enabled';
  
  try {
    const firestore = admin.firestore();
    const userDocRef = firestore.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
        return { success: false, message: "User not found in Firestore." };
    }

    const userData = userDoc.data();
    if (userData?.role === UserRole.Admin) {
        return { success: false, message: "Administrator accounts cannot be disabled." };
    }

    // 1. Update the user in Firebase Authentication
    await admin.auth().updateUser(uid, { disabled: disable });

    // 2. Update the user document in Firestore
    await userDocRef.update({ disabled: disable });

    return {
      success: true,
      message: `Successfully ${pastTenseAction} user.`,
    };
  } catch (error: any) {
    console.error(`Failed to ${action} user ${uid}:`, error);

    let message = error.message || 'An unknown error occurred.';
    if (error.code === 'auth/user-not-found') {
        message = 'The user does not exist in Firebase Authentication.';
    }

    return {
      success: false,
      message: message,
    };
  }
}
