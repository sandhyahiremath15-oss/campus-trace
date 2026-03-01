
'use client';

import React, { useState, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

/**
 * @fileOverview A robust Firebase provider that prevents hydration mismatches.
 * It ensures that the first client-side render matches the server-side render
 * by deferring Firebase initialization until after the initial mount.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<{ app: any, db: any, auth: any }>({
    app: null,
    db: null,
    auth: null,
  });

  useEffect(() => {
    // Only initialize on the client after the first render
    const initialized = initializeFirebase();
    setFirebase(initialized);
  }, []);

  return (
    <FirebaseProvider app={firebase.app} firestore={firebase.db} auth={firebase.auth}>
      {children}
    </FirebaseProvider>
  );
}
