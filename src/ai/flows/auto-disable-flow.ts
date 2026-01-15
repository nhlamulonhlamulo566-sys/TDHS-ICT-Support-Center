
'use server';
/**
 * @fileOverview A flow to automatically disable inactive users.
 */

import { z } from 'zod';
import admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '@/firebase/admin-init';
import { UserRole } from '@/lib/types';
import type { User } from '@/lib/types';

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

const AutoDisableOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  disabledUsers: z.array(z.string()),
});

export type AutoDisableOutput = z.infer<typeof AutoDisableOutputSchema>;

// This is a regular server-side function, not a Genkit flow.
export async function autoDisableInactiveUsers(): Promise<AutoDisableOutput> {
  const firestore = admin.firestore();
  const auth = admin.auth();
  const usersRef = firestore.collection('users');
  
  const disabledUserIds: string[] = [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const snapshot = await usersRef.get();
    if (snapshot.empty) {
      return { success: true, message: "No users found to check.", disabledUsers: [] };
    }

    const promises: Promise<void>[] = [];

    snapshot.forEach(doc => {
      const user = doc.data() as User;
      const uid = doc.id;

      // Skip Admins, already disabled users, or users with no last login time
      if (user.role === UserRole.Admin || user.disabled || !user.lastLoginAt) {
        return;
      }
      
      const rolesToDisable = [UserRole.Technician, UserRole.Supervisor];
      if (!rolesToDisable.includes(user.role)) {
          return;
      }

      const lastLoginDate = user.lastLoginAt.toDate();
      if (lastLoginDate < sevenDaysAgo) {
        // Add disable operations to a promise array to run in parallel
        promises.push(
          (async () => {
            console.log(`Disabling user ${uid} (${user.email}) due to inactivity.`);
            // Disable in Auth
            await auth.updateUser(uid, { disabled: true });
            // Disable in Firestore
            await usersRef.doc(uid).update({ disabled: true });
            disabledUserIds.push(user.email);
          })()
        );
      }
    });

    await Promise.all(promises);

    const message = disabledUserIds.length > 0
      ? `Successfully disabled ${disabledUserIds.length} inactive users.`
      : "No inactive users to disable.";
      
    return {
      success: true,
      message,
      disabledUsers: disabledUserIds,
    };

  } catch (error: any) {
    console.error('Error during auto-disabling inactive users:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred during the process.',
      disabledUsers: [],
    };
  }
}
