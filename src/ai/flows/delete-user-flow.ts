
'use server';
/**
 * @fileOverview A secure flow for permanently deleting a user and their associated Firestore document.
 */

import { z } from 'zod';
import admin from 'firebase-admin';
import { UserRole } from '@/lib/types';

// Initialize Firebase Admin SDK if it hasn't been already.
if (!admin.apps.length) {
  admin.initializeApp();
}

const DeleteUserInputSchema = z.object({
  uid: z.string().min(1, { message: "User ID is required." }),
});

export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

const DeleteUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type DeleteUserOutput = z.infer<typeof DeleteUserOutputSchema>;


// This is now a regular server-side function, not a Genkit flow.
export async function deleteUser(input: DeleteUserInput): Promise<DeleteUserOutput> {
  const { uid } = input;
  const firestore = admin.firestore();
  
  try {
    // 1. Check user role from Firestore before deleting
    const userDocRef = firestore.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
        // Even if user doc does not exist, try to delete from Auth to be safe
        await admin.auth().deleteUser(uid);
        return {
            success: true,
            message: `User with ID ${uid} deleted from Authentication. No Firestore record was found.`,
        };
    }

    const userData = userDoc.data();
    if (userData?.role === UserRole.Admin) {
      return {
        success: false,
        message: "Administrator accounts cannot be deleted.",
      };
    }
    
    // 2. Delete the user from Firebase Authentication
    await admin.auth().deleteUser(uid);

    // 3. Delete the user document from Firestore
    await userDocRef.delete();

    return {
      success: true,
      message: `Successfully deleted user with ID ${uid}.`,
    };
  } catch (error: any) {
    console.error(`Failed to delete user ${uid}:`, error);

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
