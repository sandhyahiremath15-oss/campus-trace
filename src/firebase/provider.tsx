'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { initializeFirebase } from './init';

interface FirebaseContextType {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  isInitialized: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  firestore: null,
  auth: null,
  isInitialized: false,
});

/**
 * Robust Firebase Provider that handles hydration safely.
 * Ensures Firebase is only initialized on the client after initial mount to prevent hydration mismatches.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FirebaseContextType>({
    app: null,
    firestore: null,
    auth: null,
    isInitialized: false,
  });

  useEffect(() => {
    // Perform initialization once on client mount
    const initialized = initializeFirebase();
    setState({
      ...initialized,
      isInitialized: true,
    });
  }, []);

  return (
    <FirebaseContext.Provider value={state}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}

export function useFirestore() {
  const context = useContext(FirebaseContext);
  return context.firestore;
}

export function useAuth() {
  const context = useContext(FirebaseContext);
  return context.auth;
}
