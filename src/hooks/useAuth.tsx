"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@/types';
import { auth, db } from '@/lib/firebase';
import { signInWithGoogle, signInWithStudentId, signOut as authSignOut } from '@/lib/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  userDoc: User | null;
  role: string | null;
  loading: boolean;
  signInWithGoogle: typeof signInWithGoogle;
  signInWithStudentId: typeof signInWithStudentId;
  signOut: typeof authSignOut;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userDoc: null,
  role: null,
  loading: true,
  signInWithGoogle: signInWithGoogle,
  signInWithStudentId: signInWithStudentId,
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

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
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

    return () => {
      mounted = false;
      unsubscribeAuth();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userDoc, role, loading, signInWithGoogle, signInWithStudentId, signOut: authSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
