import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';

export interface ImageUploadProps {
  onUploadComplete: (url: string, key: string) => void;
  onError?: (error: string) => void;
  currentImage?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  uploadPath?: string;
}

export default function ImageUpload({
  onUploadComplete,
  onError,
  currentImage,
  label = 'Upload de Imagem',
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSizeMB = 5,
  className = '',
  uploadPath = 'uploads/'
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    // Validação de tipo
    const allowedTypes = accept.split(',').map(t => t.trim());
    if (!allowedTypes.includes(file.type)) {
      onError?.(`Tipo de arquivo não permitido. Use: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validação de tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      onError?.(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
      return;
    }

    // Gera preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Faz upload
    setIsUploading(true);
    try {
      // Gera nome único
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const key = `${uploadPath}${timestamp}-${randomString}.${extension}`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer upload');
      }

      const result = await response.json();
      onUploadComplete(result.url, result.key);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload';
      onError?.(errorMessage);
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-bold text-[var(--primary-dark)] mb-2 uppercase tracking-wide">
        {label}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-xl transition-all ${
          dragActive 
            ? 'border-[var(--primary-teal)] bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${preview ? 'p-0' : 'p-8'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            
            {!isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm font-semibold">Enviando...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
              disabled={isUploading}
            />

            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {isUploading ? (
                <Loader className="w-8 h-8 text-gray-400 animate-spin" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-2 bg-[var(--primary-teal)] hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Escolher Arquivo
            </button>

            <p className="text-sm text-gray-500 mt-3">
              ou arraste e solte aqui
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WEBP até {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
