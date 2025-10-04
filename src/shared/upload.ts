/**
 * Serviço de Upload de Imagens para Cloudflare R2
 * 
 * Suporta:
 * - Upload de logos de estabelecimentos
 * - Upload de fotos de bags
 * - Validação de tamanho e tipo
 * - Geração de URLs públicas
 */

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

export interface UploadOptions {
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSizeInMB: 5,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

/**
 * Valida arquivo antes do upload
 */
export function validateFile(
  file: File,
  options: UploadOptions = DEFAULT_OPTIONS
): { valid: boolean; error?: string } {
  const { maxSizeInMB, allowedTypes } = { ...DEFAULT_OPTIONS, ...options };
  
  // Valida tipo
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Use: ${allowedTypes.join(', ')}`
    };
  }
  
  // Valida tamanho
  const maxSizeInBytes = (maxSizeInMB || 5) * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB`
    };
  }
  
  return { valid: true };
}

/**
 * Gera nome único para arquivo
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Converte File para ArrayBuffer
 */
export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Faz upload de imagem para o R2
 * 
 * @param file - Arquivo a ser enviado
 * @param path - Caminho/prefixo no bucket (ex: 'logos/', 'bags/')
 * @param options - Opções de validação
 * @returns URL pública da imagem
 */
export async function uploadImage(
  file: File,
  path: string = '',
  options: UploadOptions = DEFAULT_OPTIONS
): Promise<UploadResult> {
  // Valida arquivo
  const validation = validateFile(file, options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Gera nome único
  const fileName = generateUniqueFileName(file.name);
  const key = `${path}${fileName}`;
  
  // Converte para ArrayBuffer
  const arrayBuffer = await fileToArrayBuffer(file);
  
  // Faz upload via API
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
  
  return {
    url: result.url,
    key: result.key,
    size: file.size,
    contentType: file.type
  };
}

/**
 * Faz upload de múltiplas imagens
 */
export async function uploadMultipleImages(
  files: File[],
  path: string = '',
  options: UploadOptions = DEFAULT_OPTIONS
): Promise<UploadResult[]> {
  const uploads = files.map(file => uploadImage(file, path, options));
  return Promise.all(uploads);
}

/**
 * Deleta imagem do R2
 */
export async function deleteImage(key: string): Promise<void> {
  const response = await fetch(`/api/upload/${encodeURIComponent(key)}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar imagem');
  }
}

/**
 * Redimensiona imagem no client-side antes do upload (opcional)
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas não suportado'));
      return;
    }
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Calcula proporção
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Desenha imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Converte para Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Erro ao redimensionar imagem'));
          }
        },
        file.type,
        0.9 // Qualidade 90%
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Preview de imagem antes do upload
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
