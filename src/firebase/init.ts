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
  // Never run on server
  if (typeof window === 'undefined') {
    return { app: null, db: null, auth: null };
  }

  try {
    // Sanitize and validate config values safely
    const safeTrim = (val: any) => (typeof val === 'string' ? val.trim() : '');
    
    const config = {
      apiKey: safeTrim(firebaseConfig.apiKey),
      authDomain: safeTrim(firebaseConfig.authDomain),
      projectId: safeTrim(firebaseConfig.projectId),
      storageBucket: safeTrim(firebaseConfig.storageBucket),
      messagingSenderId: safeTrim(firebaseConfig.messagingSenderId),
      appId: safeTrim(firebaseConfig.appId)
    };

    const isConfigValid = !!config.apiKey && !!config.projectId;

    if (!isConfigValid) {
      console.warn('CampusTrace: Firebase configuration is missing or incomplete. Some features will be disabled.');
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
    console.error('CampusTrace: Firebase initialization failed:', error);
    return { app: null, db: null, auth: null };
  }
}
