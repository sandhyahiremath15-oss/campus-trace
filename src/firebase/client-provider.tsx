
'use client';

import React, { useState, useEffect } from 'react';
import { initializeFirebase } from './init';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialized = initializeFirebase();
    setFirebase(initialized);
    setMounted(true);
  }, []);

  // During SSR and first client-side render, we provide nulls to maintain consistency
  return (
    <FirebaseProvider app={firebase.app} firestore={firebase.db} auth={firebase.auth}>
      {children}
    </FirebaseProvider>
  );
}
