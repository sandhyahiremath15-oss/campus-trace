'use client';

import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase in a browser-safe way.
 * Hardened to prevent client-side exceptions during hydration.
 */
export function initializeFirebase() {
  // Return empty objects for server-side rendering
  if (typeof window === 'undefined') {
    return { app: null, firestore: null, auth: null };
  }

  try {
    const config = {
      apiKey: firebaseConfig.apiKey?.trim(),
      authDomain: firebaseConfig.authDomain?.trim(),
      projectId: firebaseConfig.projectId?.trim(),
      storageBucket: firebaseConfig.storageBucket?.trim(),
      messagingSenderId: firebaseConfig.messagingSenderId?.trim(),
      appId: firebaseConfig.appId?.trim()
    };

    // We check for minimal config but don't hard-fail here to prevent app crash
    const isConfigAvailable = !!config.apiKey && !!config.projectId;
    if (!isConfigAvailable) {
      console.warn('CampusTrace: Firebase config is missing. Ensure environment variables are set in Vercel.');
    }

    let app: FirebaseApp;
    const existingApps = getApps();
    
    if (existingApps.length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }

    const firestore = getFirestore(app);
    const auth = getAuth(app);

    return { app, firestore, auth };
  } catch (error) {
    console.error('CampusTrace: Firebase initialization failed:', error);
    return { app: null, firestore: null, auth: null };
  }
}
