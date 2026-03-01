
'use client';

import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

/**
 * Initializes Firebase in a browser-safe way.
 * Returns null values if the environment is not a browser or config is invalid.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { app: null, db: null, auth: null };
  }

  try {
    const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

    if (!isConfigValid) {
      console.warn('Firebase config is incomplete. Check environment variables.');
      return { app: null, db: null, auth: null };
    }

    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    if (app) {
      db = getFirestore(app);
      auth = getAuth(app);
    }

    return { app, db, auth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, db: null, auth: null };
  }
}
