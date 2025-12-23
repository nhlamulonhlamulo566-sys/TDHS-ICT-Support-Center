
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // While loading, show a loading state to prevent layout shifts.
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>Authenticating...</p>
      </div>
    );
  }

  // If there's a user, render the children (the protected page).
  if (user) {
    return <>{children}</>;
  }

  // If no user and not loading, render null. The useEffect will handle the redirect.
  return null;
}
