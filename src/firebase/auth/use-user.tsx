
'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

/**
 * @fileOverview A hydration-safe hook to access the current Firebase user.
 * Fixed: Now sets loading to false even if auth is unavailable to prevent page hangs.
 */
export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is not available (e.g. missing config), we must set loading to false
    // so that consuming components can proceed to fallback states.
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
