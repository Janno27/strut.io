"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getOptimizedImageUrl, getNextImageProps, preloadImage } from "@/lib/services/image-cache"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  quality?: number
  sizes?: string
  className?: string
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
  objectPosition?: string
  onLoad?: () => void
  onError?: () => void
  preload?: boolean
  // Options de cache spécifiques
  cacheWidth?: number
  cacheHeight?: number
  cacheQuality?: number
  cacheFormat?: 'webp' | 'avif' | 'jpg' | 'png'
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 85,
  sizes,
  className,
  objectFit = "cover",
  objectPosition,
  onLoad,
  onError,
  preload = false,
  cacheWidth,
  cacheHeight,
  cacheQuality,
  cacheFormat
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>("")

  // Validation initiale du src
  if (!src || typeof src !== 'string' || src.trim() === "") {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground text-sm",
          className
        )}
        style={{ width, height: fill ? "100%" : height }}
      >
        Aucune image
      </div>
    )
  }

  useEffect(() => {
    if (!src || typeof src !== 'string' || src.trim() === "") {
      setImageSrc("")
      return
    }

    // Mapper objectFit CSS vers les valeurs de l'API de cache
    const mapObjectFitToCacheFit = (fit: string) => {
      switch (fit) {
        case "contain": return "contain"
        case "cover": return "cover"
        case "fill": return "fill"
        case "none": return "inside" // Fallback pour 'none'
        case "scale-down": return "inside" // Fallback pour 'scale-down'
        default: return "cover"
      }
    }

    // Générer l'URL optimisée
    const optimizedUrl = getOptimizedImageUrl(src, {
      width: cacheWidth || width,
      height: cacheHeight || height,
      quality: cacheQuality || quality,
      format: cacheFormat,
      fit: mapObjectFitToCacheFit(objectFit)
    })

    setImageSrc(optimizedUrl)

    // Précharger si demandé (seulement si on a une URL valide)
    if (preload && priority && optimizedUrl && optimizedUrl.trim() !== "") {
      preloadImage(src, {
        width: cacheWidth || width,
        height: cacheHeight || height,
        quality: cacheQuality || quality
      })
    }
  }, [src, width, height, quality, objectFit, cacheWidth, cacheHeight, cacheQuality, cacheFormat, preload, priority])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  // Fallback pour les erreurs d'image
  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground text-sm",
          className
        )}
        style={{ width, height: fill ? "100%" : height }}
      >
        Image non disponible
      </div>
    )
  }

  // Ne pas rendre le composant Image si imageSrc est vide
  if (!imageSrc || imageSrc.trim() === "") {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground text-sm",
          className
        )}
        style={{ width, height: fill ? "100%" : height }}
      >
        Chargement...
      </div>
    )
  }

  // Props pour Next.js Image
  const imageProps = {
    src: imageSrc,
    alt,
    width: fill ? undefined : width,
    height: fill ? undefined : height,
    fill,
    priority,
    quality,
    sizes: sizes || (fill ? "100vw" : undefined),
    className: cn(
      "transition-opacity duration-300",
      isLoading ? "opacity-0" : "opacity-100",
      className
    ),
    style: {
      objectFit,
      objectPosition
    },
    onLoad: handleLoad,
    onError: handleError
  }

  return (
    <>
      {/* Skeleton de chargement */}
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted animate-pulse rounded",
            className
          )}
        />
      )}
      
      {/* Image optimisée */}
      <Image {...imageProps} />
    </>
  )
}

// Hook pour obtenir les props Next.js optimisées
export function useOptimizedImageProps(src: string, alt: string, priority: boolean = false) {
  return getNextImageProps(src, alt, priority)
}

// Composant spécialisé pour les avatars/images rondes
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height' | 'fill'> & {
  size?: number
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full", className)}
      cacheWidth={size * 2} // 2x pour les écrans haute résolution
      cacheHeight={size * 2}
      cacheQuality={90}
      objectFit="cover"
      {...props}
    />
  )
}

// Composant spécialisé pour les images de couverture
export function OptimizedCoverImage({
  src,
  alt,
  aspectRatio = "16/9",
  className,
  ...props
}: Omit<OptimizedImageProps, 'fill'> & {
  aspectRatio?: string
}) {
  return (
    <div className="relative overflow-hidden" style={{ aspectRatio }}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        cacheWidth={1200}
        cacheHeight={675} // 16:9 ratio
        cacheQuality={85}
        {...props}
      />
    </div>
  )
} 