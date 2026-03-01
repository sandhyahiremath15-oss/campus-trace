
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
    // Sanitize and validate config
    const config = {
      apiKey: firebaseConfig.apiKey?.trim(),
      authDomain: firebaseConfig.authDomain?.trim(),
      projectId: firebaseConfig.projectId?.trim(),
      storageBucket: firebaseConfig.storageBucket?.trim(),
      messagingSenderId: firebaseConfig.messagingSenderId?.trim(),
      appId: firebaseConfig.appId?.trim()
    };

    const isConfigValid = !!config.apiKey && !!config.projectId;

    if (!isConfigValid) {
      console.warn('Firebase configuration is incomplete. Authentication and database features may be disabled.');
      return { app: null, db: null, auth: null };
    }

    let app: FirebaseApp;
    const existingApps = getApps();
    
    if (existingApps.length === 0) {
      app = initializeApp(config);
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
