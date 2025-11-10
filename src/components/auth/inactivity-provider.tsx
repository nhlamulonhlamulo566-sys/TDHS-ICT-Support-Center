'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

interface InactivityContextType {
  resetTimer: () => void;
}

const InactivityContext = createContext<InactivityContextType | undefined>(undefined);

export const useInactivity = () => {
  const context = useContext(InactivityContext);
  if (!context) {
    throw new Error('useInactivity must be used within an InactivityProvider');
  }
  return context;
};

export function InactivityProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const [isInactive, setIsInactive] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const handleLogout = useCallback(() => {
    if (auth.currentUser) {
        auth.signOut();
        setIsInactive(true);
    }
  }, [auth]);
  
  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
  }, []);


  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);


  useEffect(() => {
     let inactivityTimer: NodeJS.Timeout;

    if (auth.currentUser) {
        inactivityTimer = setInterval(() => {
            if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
                handleLogout();
            }
        }, 1000); // Check every second
    }

    return () => {
        if (inactivityTimer) {
            clearInterval(inactivityTimer);
        }
    };
  }, [auth.currentUser, lastActivity, handleLogout]);

  const handleDialogClose = () => {
    setIsInactive(false);
    router.push('/login');
  };

  return (
    <InactivityContext.Provider value={{ resetTimer }}>
      {children}
      <AlertDialog open={isInactive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have been logged out</AlertDialogTitle>
            <AlertDialogDescription>
              For your security, you have been logged out due to inactivity. Please log in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleDialogClose}>
            Log In
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </InactivityContext.Provider>
  );
}
