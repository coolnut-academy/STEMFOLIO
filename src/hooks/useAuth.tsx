"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@/types';
import { auth, db } from '@/lib/firebase';
import { signInWithGoogle, signOut as authSignOut, handleRedirectResult } from '@/lib/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  userDoc: User | null;
  role: string | null;
  loading: boolean;
  signInWithGoogle: typeof signInWithGoogle;
  signOut: typeof authSignOut;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userDoc: null,
  role: null,
  loading: true,
  signInWithGoogle: signInWithGoogle,
  signOut: authSignOut,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kick off redirect-result processing immediately. We keep a reference to
    // this promise so the auth-state handler can wait for it before committing
    // state — preventing the brief null-user flash that causes AuthGuard to
    // redirect to /login before Firebase has finished processing the redirect.
    const redirectPromise = handleRedirectResult().catch((e) => {
      console.error('[auth] redirect result error:', e);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Always wait for redirect processing to settle first.
      await redirectPromise;

      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          const fetchedUserDoc = snap.exists() ? (snap.data() as User) : null;
          const fetchedRole = fetchedUserDoc?.role ?? 'student';
          setUser(firebaseUser);
          setUserDoc(fetchedUserDoc);
          setRole(fetchedRole);
        } catch (e) {
          console.error('[auth] failed to fetch user doc:', e);
          setUser(firebaseUser);
          setUserDoc(null);
          setRole('student');
        }
      } else {
        setUser(null);
        setUserDoc(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userDoc, role, loading, signInWithGoogle, signOut: authSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
