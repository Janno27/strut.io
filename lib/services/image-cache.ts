interface ImageCacheOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpg' | 'png'
  fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
}

// Configuration du cache par défaut
const DEFAULT_CACHE_OPTIONS: ImageCacheOptions = {
  quality: 85,
  format: 'webp', // Format moderne avec bonne compression
  fit: 'cover'
}

// Cache en mémoire pour les URLs transformées
const imageUrlCache = new Map<string, string>()

/**
 * Génère une URL optimisée pour les images Supabase avec transformation
 * Utilise les capacités de transformation de Supabase CDN
 */
export function getOptimizedImageUrl(
  originalUrl: string, 
  options: ImageCacheOptions = {}
): string {
  // Validation de l'URL d'entrée
  if (!originalUrl || originalUrl.trim() === "") {
    return ""
  }
  
  // Si l'URL n'est pas une URL Supabase, retourner l'originale
  if (!originalUrl.includes('supabase')) {
    return originalUrl
  }

  const mergedOptions = { ...DEFAULT_CACHE_OPTIONS, ...options }
  
  // Créer une clé de cache basée sur l'URL et les options
  const cacheKey = `${originalUrl}:${JSON.stringify(mergedOptions)}`
  
  // Vérifier le cache en mémoire
  if (imageUrlCache.has(cacheKey)) {
    return imageUrlCache.get(cacheKey)!
  }

  try {
    const url = new URL(originalUrl)
    
    // Ajouter les paramètres de transformation Supabase
    const params = new URLSearchParams()
    
    if (mergedOptions.width) {
      params.set('width', mergedOptions.width.toString())
    }
    
    if (mergedOptions.height) {
      params.set('height', mergedOptions.height.toString())
    }
    
    if (mergedOptions.quality) {
      params.set('quality', mergedOptions.quality.toString())
    }
    
    if (mergedOptions.format) {
      params.set('format', mergedOptions.format)
    }
    
    if (mergedOptions.fit) {
      params.set('resize', mergedOptions.fit)
    }

    // Construire l'URL optimisée
    const optimizedUrl = `${url.origin}${url.pathname}?${params.toString()}`
    
    // Mettre en cache
    imageUrlCache.set(cacheKey, optimizedUrl)
    
    return optimizedUrl
  } catch (error) {
    console.warn('Erreur lors de l\'optimisation de l\'URL:', error)
    return originalUrl
  }
}

/**
 * Génère plusieurs tailles d'images pour le responsive design
 */
export function getResponsiveImageUrls(originalUrl: string): {
  thumbnail: string  // 150x150
  small: string      // 300x300
  medium: string     // 600x600
  large: string      // 1200x1200
  original: string   // Image originale optimisée
} {
  // Si l'URL originale est vide, retourner des URLs vides
  if (!originalUrl || originalUrl.trim() === "") {
    return {
      thumbnail: "",
      small: "",
      medium: "",
      large: "",
      original: ""
    }
  }

  return {
    thumbnail: getOptimizedImageUrl(originalUrl, { width: 150, height: 150, quality: 75 }),
    small: getOptimizedImageUrl(originalUrl, { width: 300, height: 300, quality: 80 }),
    medium: getOptimizedImageUrl(originalUrl, { width: 600, height: 600, quality: 85 }),
    large: getOptimizedImageUrl(originalUrl, { width: 1200, height: 1200, quality: 90 }),
    original: getOptimizedImageUrl(originalUrl, { quality: 95 })
  }
}

/**
 * Hook Next.js pour précharger les images critiques
 */
export function preloadImage(src: string, options: ImageCacheOptions = {}): void {
  if (typeof window === 'undefined') return
  if (!src || src.trim() === "") return
  
  const optimizedUrl = getOptimizedImageUrl(src, options)
  
  // Ne pas précharger si l'URL optimisée est vide
  if (!optimizedUrl || optimizedUrl.trim() === "") return
  
  // Créer un élément link pour le préchargement
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = optimizedUrl
  
  // Ajouter au head si pas déjà présent
  const existing = document.querySelector(`link[href="${optimizedUrl}"]`)
  if (!existing) {
    document.head.appendChild(link)
  }
}

/**
 * Fonction pour nettoyer le cache (utile pour les tests ou la gestion mémoire)
 */
export function clearImageCache(): void {
  imageUrlCache.clear()
}

/**
 * Obtenir la taille du cache actuel
 */
export function getImageCacheSize(): number {
  return imageUrlCache.size
}

/**
 * Génère des paramètres srcSet pour Next.js Image
 */
export function generateSrcSet(originalUrl: string, sizes: number[] = [640, 750, 828, 1080, 1200, 1920]): string {
  return sizes
    .map(size => `${getOptimizedImageUrl(originalUrl, { width: size })} ${size}w`)
    .join(', ')
}

/**
 * Configuration recommandée pour Next.js Image component
 */
export function getNextImageProps(originalUrl: string, alt: string, priority: boolean = false) {
  const responsiveUrls = getResponsiveImageUrls(originalUrl)
  
  return {
    src: responsiveUrls.medium,
    alt,
    priority,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    placeholder: 'blur' as const,
    blurDataURL: getOptimizedImageUrl(originalUrl, { width: 10, height: 10, quality: 10 })
  }
} 