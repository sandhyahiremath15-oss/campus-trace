'use client';

import { initializeApp, getApps, FirebaseApp, getApp, deleteApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
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
    const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

    if (!isConfigValid) {
      console.warn('Firebase configuration is incomplete. Check your environment variables.');
      return { app: null, db: null, auth: null };
    }

    let app: FirebaseApp;
    const existingApps = getApps();
    
    if (existingApps.length === 0) {
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
