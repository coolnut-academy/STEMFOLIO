import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  getIdTokenResult
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/types';

export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signUpWithEmail = async (email: string, password: string, name: string, nickname?: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user doc in Firestore
  const userDocRef = doc(db, 'users', user.uid);
  const userData: Partial<User> = {
    id: user.uid,
    email: user.email!,
    name,
    nickname: nickname || '',
    role: 'student', // Default role is student
    projectIds: [],
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };
  await setDoc(userDocRef, userData);

  return user;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null, userDoc: User | null, role: string | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Get role from custom claims
      const tokenResult = await getIdTokenResult(firebaseUser);
      const role = (tokenResult.claims.role as string) || 'student';

      // Fetch user doc
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userDoc = userDocSnap.exists() ? (userDocSnap.data() as User) : null;

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
