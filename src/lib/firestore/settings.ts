import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_DOC_ID = 'categories';

export const getCategories = async (): Promise<string[]> => {
  const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    return snapshot.data().items || [];
  }
  
  // If the doc doesn't exist, return default categories
  return ["ฟิสิกส์", "เคมี", "ชีววิทยา", "คณิตศาสตร์", "คอมพิวเตอร์", "วิศวกรรม", "สิ่งแวดล้อม"];
};

export const updateCategories = async (items: string[]): Promise<void> => {
  const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
  await setDoc(docRef, { items }, { merge: true });
};
