import { useState, useRef } from 'react';
import { X, Loader, Plus } from 'lucide-react';

export interface MultiImageUploadProps {
  onUploadComplete: (urls: string[], keys: string[]) => void;
  onError?: (error: string) => void;
  currentImages?: string[];
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  maxImages?: number;
  className?: string;
  uploadPath?: string;
}

export default function MultiImageUpload({
  onUploadComplete,
  onError,
  currentImages = [],
  label = 'Upload de Fotos',
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSizeMB = 5,
  maxImages = 5,
  className = '',
  uploadPath = 'uploads/'
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(currentImages);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (files: FileList) => {
    const filesArray = Array.from(files);
    
    // Limita número de imagens
    if (previews.length + filesArray.length > maxImages) {
      onError?.(`Máximo de ${maxImages} fotos permitidas`);
      return;
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];
    const uploadedKeys: string[] = [];

    try {
      for (const file of filesArray) {
        // Validação de tipo
        const allowedTypes = accept.split(',').map(t => t.trim());
        if (!allowedTypes.includes(file.type)) {
          onError?.(`Tipo de arquivo não permitido: ${file.name}`);
          continue;
        }

        // Validação de tamanho
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          onError?.(`Arquivo muito grande: ${file.name} (máx ${maxSizeMB}MB)`);
          continue;
        }

        // Gera preview
        const previewUrl = await createPreview(file);
        setPreviews(prev => [...prev, previewUrl]);

        // Faz upload
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
        uploadedUrls.push(result.url);
        uploadedKeys.push(result.key);
      }

      if (uploadedUrls.length > 0) {
        onUploadComplete([...currentImages, ...uploadedUrls], uploadedKeys);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload';
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    
    // Notifica mudança
    onUploadComplete(newPreviews, []);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-bold text-[var(--primary-dark)] mb-2 uppercase tracking-wide">
        {label} ({previews.length}/{maxImages})
      </label>

      {/* Grid de Fotos */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={preview}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
            />
            
            {!isUploading && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {/* Botão Adicionar (se não atingiu o limite) */}
        {previews.length < maxImages && (
          <div
            className={`aspect-square border-2 border-dashed rounded-lg transition-all cursor-pointer flex items-center justify-center ${
              dragActive 
                ? 'border-[var(--primary-teal)] bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple
              onChange={(e) => e.target.files && handleFileChange(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />

            {isUploading ? (
              <Loader className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <div className="text-center p-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 font-semibold">
                  Adicionar
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        PNG, JPG, WEBP até {maxSizeMB}MB cada. Máximo {maxImages} fotos.
      </p>
    </div>
  );
}
