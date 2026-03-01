
'use client';

import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

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
      return { app: null, db: null, auth: null };
    }

    let app: FirebaseApp;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    return { 
      app, 
      db: getFirestore(app), 
      auth: getAuth(app) 
    };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, db: null, auth: null };
  }
}
