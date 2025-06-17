import imageCompression from 'browser-image-compression'

interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  fileType?: string
  quality?: number
}

// Options optimisées pour préserver la qualité
const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeMB: 2, // Limite à 2MB pour éviter les problèmes de réseau
  maxWidthOrHeight: 2048, // Résolution maximale raisonnable pour le web
  useWebWorker: true, // Utilise un web worker pour ne pas bloquer l'UI
  quality: 0.9, // Qualité très élevée (90%)
  fileType: 'image/jpeg' // JPEG pour un bon compromis qualité/taille
}

// Options spéciales pour les images principales (qualité maximale)
const MAIN_IMAGE_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeMB: 3, // Un peu plus grand pour l'image principale
  maxWidthOrHeight: 2560, // Plus haute résolution pour l'image principale
  useWebWorker: true,
  quality: 0.95, // 95% de qualité pour l'image principale
  fileType: 'image/jpeg'
}

export async function compressImage(
  file: File, 
  isMainImage: boolean = false
): Promise<File> {
  try {
    const options = isMainImage ? MAIN_IMAGE_COMPRESSION_OPTIONS : DEFAULT_COMPRESSION_OPTIONS
    
    console.log(`Compression de l'image: ${file.name}`)
    console.log(`Taille originale: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    
    const compressedFile = await imageCompression(file, options)
    
    console.log(`Taille compressée: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
    console.log(`Réduction: ${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`)
    
    return compressedFile
  } catch (error) {
    console.error('Erreur lors de la compression:', error)
    // En cas d'erreur, retourner le fichier original
    console.warn('Utilisation du fichier original sans compression')
    return file
  }
}

// Fonction pour valider et compresser une image
export async function validateAndCompressImage(
  file: File,
  isMainImage: boolean = false
): Promise<{ isValid: boolean; file?: File; error?: string }> {
  // Validation basique
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Le fichier doit être une image' }
  }
  
  // Taille maximale avant compression (50MB)
  const maxFileSize = 50 * 1024 * 1024
  if (file.size > maxFileSize) {
    return { isValid: false, error: 'Le fichier est trop volumineux (max 50MB)' }
  }
  
  try {
    // Compresser l'image
    const compressedFile = await compressImage(file, isMainImage)
    return { isValid: true, file: compressedFile }
  } catch (error) {
    console.error('Erreur lors de la validation/compression:', error)
    return { isValid: false, error: 'Erreur lors du traitement de l\'image' }
  }
}

// Types d'images supportées
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
]

// Fonction utilitaire pour vérifier si un fichier est une image supportée
export function isSupportedImageType(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(file.type)
} 