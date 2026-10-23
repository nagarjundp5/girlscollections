'use client';

import React, { useState } from 'react';
import { ProductImageItem, CloudinaryAsset } from '@/types';
import { Upload, X, Star, RefreshCw, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

interface CloudinaryImageUploaderProps {
  images: ProductImageItem[];
  onChange: (images: ProductImageItem[]) => void;
  folder?: string;
  maxFiles?: number;
}

interface UploadProgressItem {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'error' | 'success';
  errorMessage?: string;
}

export const CloudinaryImageUploader: React.FC<CloudinaryImageUploaderProps> = ({
  images,
  onChange,
  folder = 'tgc-products',
  maxFiles = 10,
}) => {
  const { addToast } = useToast();
  const [uploadQueue, setUploadQueue] = useState<UploadProgressItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const getAdminThumbnail = (url: string) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto,f_auto/');
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return `Invalid format [${file.type}]. Accepted: JPG, PNG, WEBP`;
    }
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      return `File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds 10MB limit`;
    }
    return null;
  };

  const uploadFileToCloudinary = async (file: File, queueId: string) => {
    try {
      // 1. Fetch signed signature parameters from API route
      const timestamp = Math.floor(Date.now() / 1000);
      const params = { folder, timestamp };

      const signRes = await fetch('/api/admin/cloudinary-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params }),
      });

      if (!signRes.ok) throw new Error('Failed to obtain Cloudinary upload signature');
      const signData = await signRes.json();

      // 2. Perform signed upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signData.signature);
      formData.append('folder', folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`;

      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadQueue((prev) =>
            prev.map((item) => (item.id === queueId ? { ...item, progress: percent } : item))
          );
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          const newAsset: ProductImageItem = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            uploadedAt: new Date().toISOString(),
            order: images.length,
            isPrimary: images.length === 0, // First image is default primary
          };

          const updatedList = [...images, newAsset];
          // Ensure exactly one primary image
          const hasPrimary = updatedList.some((img) => img.isPrimary);
          if (!hasPrimary && updatedList.length > 0) {
            updatedList[0].isPrimary = true;
          }

          onChange(updatedList);

          setUploadQueue((prev) => prev.filter((item) => item.id !== queueId));
          addToast('Image uploaded successfully', 'success');
        } else {
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queueId
                ? { ...item, status: 'error', errorMessage: 'Upload failed' }
                : item
            )
          );
        }
      };

      xhr.onerror = () => {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueId
              ? { ...item, status: 'error', errorMessage: 'Network connection lost' }
              : item
          )
        );
      };

      xhr.send(formData);
    } catch (err: any) {
      console.error(err);
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === queueId ? { ...item, status: 'error', errorMessage: err.message } : item
        )
      );
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);

    if (images.length + fileArray.length > maxFiles) {
      addToast(`Maximum ${maxFiles} images allowed`, 'error');
      return;
    }

    fileArray.forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        addToast(validationError, 'error');
        return;
      }

      const queueId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const newItem: UploadProgressItem = {
        id: queueId,
        file,
        progress: 0,
        status: 'uploading',
      };

      setUploadQueue((prev) => [...prev, newItem]);
      uploadFileToCloudinary(file, queueId);
    });
  };

  const handleRemoveImage = async (index: number) => {
    const targetImg = images[index];
    const updated = images.filter((_, i) => i !== index);

    // Reassign primary image invariant if removed image was primary
    if (targetImg.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }

    // Re-index orders
    const reordered = updated.map((img, i) => ({ ...img, order: i }));
    onChange(reordered);

    // Call Cloudinary destroy API for remote asset cleanup
    if (targetImg.publicId) {
      try {
        await fetch('/api/admin/cloudinary-destroy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: targetImg.publicId }),
        });
        addToast('Asset destroyed from Cloudinary storage', 'success');
      } catch (err) {
        console.warn('Could not destroy Cloudinary asset:', err);
      }
    }
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileSelect(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-zariGold bg-zariGold/5 scale-[1.01]'
            : 'border-zinc-300 hover:border-zinc-800 bg-zinc-50/50'
        }`}
      >
        <input
          type="file"
          id="cloudinary-upload-input"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <label htmlFor="cloudinary-upload-input" className="cursor-pointer flex flex-col items-center justify-center">
          <Upload className="w-8 h-8 text-zinc-400 mb-2" />
          <span className="text-sm font-bold text-zinc-800">
            Drag &amp; drop product images or <span className="text-zariGold underline">browse files</span>
          </span>
          <span className="text-xs text-zinc-500 mt-1">
            PNG, JPG, WEBP up to 10MB per file. (Max {maxFiles} images)
          </span>
        </label>
      </div>

      {/* Per-File Upload Progress Queue */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          {uploadQueue.map((item) => (
            <div key={item.id} className="p-3 bg-zinc-100 rounded-lg flex items-center justify-between border border-zinc-200">
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                <ImageIcon className="w-5 h-5 text-zinc-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-800 truncate">{item.file.name}</p>
                  {item.status === 'uploading' && (
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-zariGold h-full transition-all duration-200" style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                  {item.status === 'error' && (
                    <p className="text-[10px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {item.errorMessage || 'Upload failed'}
                    </p>
                  )}
                </div>
              </div>

              {item.status === 'error' && (
                <button
                  onClick={() => {
                    setUploadQueue((prev) =>
                      prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', progress: 0 } : q))
                    );
                    uploadFileToCloudinary(item.file, item.id);
                  }}
                  className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded hover:bg-zinc-200"
                  title="Retry Upload"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Preview List Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
          {images.map((img, index) => (
            <div
              key={img.id || index}
              className={`relative group rounded-lg overflow-hidden border bg-zinc-900 aspect-square shadow-sm ${
                img.isPrimary ? 'border-2 border-zariGold ring-2 ring-zariGold/30' : 'border-zinc-200'
              }`}
            >
              <img src={getAdminThumbnail(img.url)} alt={img.altText || `Product Image ${index + 1}`} className="w-full h-full object-cover" />

              {/* Primary Star Badge */}
              <button
                type="button"
                onClick={() => handleSetPrimary(index)}
                className={`absolute top-2 left-2 p-1.5 rounded-full transition-all ${
                  img.isPrimary ? 'bg-zariGold text-white shadow-md' : 'bg-black/50 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-black/80'
                }`}
                title={img.isPrimary ? 'Primary Image' : 'Set as Primary Image'}
              >
                <Star className={`w-3.5 h-3.5 ${img.isPrimary ? 'fill-current' : ''}`} />
              </button>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all shadow-md"
                title="Remove Image"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Primary Indicator Label */}
              {img.isPrimary && (
                <div className="absolute bottom-0 inset-x-0 bg-zariGold text-white text-[9px] font-bold uppercase tracking-wider text-center py-0.5">
                  PRIMARY
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
