import React, { useRef } from 'react';
import { X, UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
  files: File[];
  previews: string[];
  uploading: boolean;
  progress: { completed: number; total: number };
  failedIndexes: number[];
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveFile: (index: number) => void;
}

export const ImageUploader = ({
  files, previews, uploading, progress, failedIndexes, onAddFiles, onRemoveFile
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          uploading
            ? 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] cursor-not-allowed'
            : 'border-[rgba(99,102,241,0.30)] bg-[rgba(99,102,241,0.05)] hover:bg-[rgba(99,102,241,0.10)] hover:border-[rgba(99,102,241,0.45)]'
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        <UploadCloud className="w-8 h-8 mx-auto text-[#818cf8]/70 mb-2" />
        <p className="text-sm text-white/70 font-medium">คลิกเพื่ออัปโหลดรูปภาพ หรือลากไฟล์มาวางที่นี่</p>
        <p className="text-xs text-white/40 mt-1">รองรับ JPEG, PNG, WEBP สูงสุด 20 รูป</p>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {previews.map((preview, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-[rgba(255,255,255,0.05)] group border border-[rgba(255,255,255,0.10)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className={`w-full h-full object-cover ${failedIndexes.includes(idx) ? 'opacity-50' : ''}`} />

              {!uploading && (
                <button
                  type="button"
                  onClick={() => onRemoveFile(idx)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {failedIndexes.includes(idx) && (
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(239,68,68,0.25)]">
                  <span className="text-xs font-bold text-[#fca5a5] bg-[rgba(0,0,0,0.55)] px-2 py-0.5 rounded">ล้มเหลว</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && progress.total > 0 && (
        <div className="text-sm text-[#818cf8] font-medium soft-pulse">
          กำลังอัปโหลด… {progress.completed}/{progress.total} ({(progress.completed / progress.total * 100).toFixed(0)}%)
        </div>
      )}
    </div>
  );
};
