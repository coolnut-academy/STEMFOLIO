import { useState, useCallback } from 'react';
import { Attachment } from '@/types';
import { uploadImages } from '@/lib/storage';

export const useImageUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [failedIndexes, setFailedIndexes] = useState<number[]>([]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const validFiles = Array.from(fileList).filter(file => 
      file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
    );
    
    if (files.length + validFiles.length > 20) {
      throw new Error('อัปโหลดรูปภาพได้สูงสุด 20 รูป');
    }

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  }, [files.length]);

  const removeFile = useCallback((index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }, [previews]);

  const uploadAll = async (projectId: string, eventId: string): Promise<Attachment[]> => {
    if (files.length === 0) return [];
    
    setUploading(true);
    setProgress({ completed: 0, total: files.length });
    setFailedIndexes([]);

    try {
      const attachments = await uploadImages(projectId, eventId, files, (completed, total, failed) => {
        setProgress({ completed, total });
        setFailedIndexes(failed);
      });
      return attachments;
    } catch (error) {
      console.error('Error in uploadAll:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const reset = useCallback(() => {
    previews.forEach(p => URL.revokeObjectURL(p));
    setFiles([]);
    setPreviews([]);
    setUploading(false);
    setProgress({ completed: 0, total: 0 });
    setFailedIndexes([]);
  }, [previews]);

  return {
    files,
    previews,
    uploading,
    progress,
    failedIndexes,
    addFiles,
    removeFile,
    uploadAll,
    reset,
  };
};
