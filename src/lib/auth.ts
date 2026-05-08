import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { User } from '@/types';

const STUDENT_EMAIL_DOMAIN = 'stemfolio.com';
const STUDENT_DEFAULT_PASSWORD = 'Stemfolio2024!';

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);

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

export const signInWithStudentId = async (studentId: string): Promise<FirebaseUser> => {
  const email = `${studentId}@${STUDENT_EMAIL_DOMAIN}`;
  const result = await signInWithEmailAndPassword(auth, email, STUDENT_DEFAULT_PASSWORD);
  return result.user;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};
