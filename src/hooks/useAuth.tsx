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

async function fetchUserDoc(firebaseUser: FirebaseUser) {
  try {
    const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userDoc = snap.exists() ? (snap.data() as User) : null;
    const role = userDoc?.role ?? 'student';
    return { userDoc, role };
  } catch (e) {
    console.error('[auth] failed to fetch user doc:', e);
    return { userDoc: null, role: 'student' };
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribeAuth: (() => void) | undefined;

    const init = async () => {
      // ── Phase 1: settle any in-flight redirect sign-in ──────────────────
      // We MUST await this before starting onAuthStateChanged. If we start
      // the listener first, it fires with null (pre-redirect state) and
      // AuthGuard redirects to /login before Firebase has processed the
      // OAuth callback.
      try {
        await handleRedirectResult();
      } catch (e) {
        console.error('[auth] redirect result error:', e);
      }

      if (!mounted) return;

      // ── Phase 2: listen to ongoing auth state ───────────────────────────
      // At this point the redirect is fully settled, so the first
      // onAuthStateChanged emission reflects the true auth state.
      unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!mounted) return;

        if (firebaseUser) {
          const { userDoc: fetchedDoc, role: fetchedRole } = await fetchUserDoc(firebaseUser);
          if (!mounted) return;
          setUser(firebaseUser);
          setUserDoc(fetchedDoc);
          setRole(fetchedRole);
        } else {
          setUser(null);
          setUserDoc(null);
          setRole(null);
        }
        setLoading(false);
      });
    };

    init();

    return () => {
      mounted = false;
      unsubscribeAuth?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userDoc, role, loading, signInWithGoogle, signOut: authSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
