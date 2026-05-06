import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { Attachment } from '@/types';
import { compressForUpload } from './compress';

export const uploadImage = async (
  projectId: string, 
  eventId: string, 
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string, name: string, id: string }> => {
  const uuid = crypto.randomUUID();
  const filePath = `projects/${projectId}/timeline/${eventId}/${uuid}.jpg`;
  const storageRef = ref(storage, filePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ url: downloadURL, name: file.name, id: uuid });
      }
    );
  });
};

export const uploadImages = async (
  projectId: string,
  eventId: string,
  files: File[],
  onProgress?: (completed: number, total: number, failedIndexes: number[]) => void
): Promise<Attachment[]> => {
  const attachments: Attachment[] = [];
  const failedIndexes: number[] = [];
  let completed = 0;

  const uploadPromises = files.map(async (file, index) => {
    try {
      const compressedFile = await compressForUpload(file);
      const result = await uploadImage(projectId, eventId, compressedFile);
      attachments.push({
        id: result.id,
        url: result.url,
        type: 'image',
        name: result.name,
      });
      completed++;
    } catch (error) {
      console.error(`Failed to upload file at index ${index}:`, error);
      failedIndexes.push(index);
    } finally {
      if (onProgress) {
        onProgress(completed, files.length, failedIndexes);
      }
    }
  });

  await Promise.allSettled(uploadPromises);
  return attachments;
};

export const deleteImages = async (urls: string[]): Promise<void> => {
  const deletePromises = urls.map(async (url) => {
    try {
      // Decode the URL to get the path
      const decodedUrl = decodeURIComponent(url);
      const urlPath = decodedUrl.split('/o/')[1].split('?')[0];
      const storageRef = ref(storage, urlPath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error(`Failed to delete image at ${url}:`, error);
    }
  });

  await Promise.allSettled(deletePromises);
};
