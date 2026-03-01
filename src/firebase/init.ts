'use client';

import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase in a browser-safe way.
 * Prevents double initialization and handles missing configuration gracefully.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { app: null, db: null, auth: null };
  }

  try {
    // Check if we have at least the minimum required config
    const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

    if (!isConfigValid) {
      console.warn('Firebase configuration is incomplete. Authentication and database features may be disabled.');
      return { app: null, db: null, auth: null };
    }

    let app: FirebaseApp;
    const existingApps = getApps();
    
    if (existingApps.length === 0) {
      // Standard initialization
      app = initializeApp(firebaseConfig);
    } else {
      // Use existing app to prevent double initialization errors
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
