"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/types';
import { onAuthStateChange, signInWithEmail, signUpWithEmail, signOut as authSignOut } from '@/lib/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  userDoc: User | null;
  role: string | null;
  loading: boolean;
  signIn: typeof signInWithEmail;
  signUp: typeof signUpWithEmail;
  signOut: typeof authSignOut;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userDoc: null,
  role: null,
  loading: true,
  signIn: signInWithEmail,
  signUp: signUpWithEmail,
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
    <AuthContext.Provider value={{ user, userDoc, role, loading, signIn: signInWithEmail, signUp: signUpWithEmail, signOut: authSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
