
'use client';

import React, { createContext, useContext } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

interface FirebaseContextType {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({
  children,
  app,
  firestore,
  auth,
}: {
  children: React.ReactNode;
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}) {
  return (
    <FirebaseContext.Provider value={{ app, firestore, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseApp() {
  const context = useContext(FirebaseContext);
  return context?.app ?? null;
}

export function useFirestore() {
  const context = useContext(FirebaseContext);
  return context?.firestore ?? null;
}

export function useAuth() {
  const context = useContext(FirebaseContext);
  return context?.auth ?? null;
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  return context ?? { app: null, firestore: null, auth: null };
}
