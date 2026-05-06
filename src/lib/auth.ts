import {
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  getIdTokenResult
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { User } from '@/types';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  // Use redirect instead of popup to avoid COOP cross-origin issues
  await signInWithRedirect(auth, provider);
};

/**
 * Call this once on app load to process the redirect result from Google Sign-In.
 * Creates the Firestore user document if this is the first sign-in.
 */
export const handleRedirectResult = async () => {
  const result = await getRedirectResult(auth);
  if (!result) return null;

  const user = result.user;

  // Check if user doc exists
  const userDocRef = doc(db, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    // Create incomplete user doc
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
    updatedAt: serverTimestamp()
  });
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null, userDoc: User | null, role: string | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Fetch user doc
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userDoc = userDocSnap.exists() ? (userDocSnap.data() as User) : null;

      // Use userDoc.role if available (since there are no Cloud Functions to sync claims), fallback to custom claims
      const tokenResult = await getIdTokenResult(firebaseUser);
      const role = userDoc?.role || (tokenResult.claims.role as string) || 'student';

      callback(firebaseUser, userDoc, role);
    } else {
      callback(null, null, null);
    }
  });
};

export const getUserRole = async (user: FirebaseUser) => {
  const tokenResult = await getIdTokenResult(user);
  return (tokenResult.claims.role as string) || 'student';
};
