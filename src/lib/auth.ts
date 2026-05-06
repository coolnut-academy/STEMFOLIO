import {
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { User } from '@/types';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  // Redirect avoids COOP cross-origin popup issues in Next.js
  await signInWithRedirect(auth, provider);
};

/**
 * Processes the OAuth redirect result when the user returns from Google.
 * Creates a Firestore user document on first sign-in.
 * Returns the FirebaseUser if a redirect was just processed, or null otherwise.
 *
 * IMPORTANT: Call this and await it BEFORE starting onAuthStateChanged,
 * otherwise the listener fires with null (pre-redirect state) and guards
 * redirect to /login before the auth state is settled.
 */
export const handleRedirectResult = async (): Promise<FirebaseUser | null> => {
  const result = await getRedirectResult(auth);
  if (!result) return null;

  const user = result.user;
  const userDocRef = doc(db, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    const userData: Partial<User> = {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || '',
      role: 'student',
      status: 'pending',
      projectIds: [],
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
    };
    await setDoc(userDocRef, userData);
  }

  return user;
};

export const updateProfile = async (uid: string, data: Partial<User>) => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};
