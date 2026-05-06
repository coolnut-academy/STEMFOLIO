import imageCompression from 'browser-image-compression';

export const compressForUpload = async (file: File): Promise<File> => {
  const options = {
    maxWidthOrHeight: 1754, // A4 at 150 DPI
    maxSizeMB: 2,
    useWebWorker: true,
    initialQuality: 0.85,
    fileType: 'image/jpeg',
  };

  try {
    const compressedFile = await imageCompression(file, options);
    // Return a File object instead of a Blob
    return new File([compressedFile], file.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};
