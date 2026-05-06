"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/types';
import { onAuthStateChange, signInWithGoogle, signOut as authSignOut } from '@/lib/auth';

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
    const unsubscribe = onAuthStateChange((firebaseUser, fetchedUserDoc, fetchedRole) => {
      setUser(firebaseUser);
      setUserDoc(fetchedUserDoc);
      setRole(fetchedRole);
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
