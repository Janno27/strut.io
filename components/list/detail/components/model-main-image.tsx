import { Button } from "@/components/ui/button"
import { Upload, X, Move } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { FocalPoint } from "../types"

interface ModelMainImageProps {
  imageUrl: string
  name: string
  isEditing: boolean
  tempMainImage?: string | null
  focalPoint?: FocalPoint
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove?: () => void
  onImageReposition: () => void
}

export function ModelMainImage({
  imageUrl,
  name,
  isEditing,
  tempMainImage,
  focalPoint,
  onImageUpload,
  onImageRemove,
  onImageReposition
}: ModelMainImageProps) {
  if (!isEditing) {
    // Mode affichage - Format uniforme pour la grille avec focal point
    const objectPosition = focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center'
    
    return (
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <OptimizedImage
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          objectPosition={objectPosition}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          cacheWidth={600}
          cacheHeight={600}
        />
      </div>
    )
  }

  // Mode édition
  return (
    <div className="relative aspect-square">
      {tempMainImage ? (
        <>
          <OptimizedImage
            src={tempMainImage}
            alt="Nouvelle image principale"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            cacheWidth={600}
            cacheHeight={600}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={onImageRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <OptimizedImage
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            objectPosition={focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center'}
            sizes="(max-width: 768px) 100vw, 50vw"
            cacheWidth={600}
            cacheHeight={600}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="h-10 w-10 text-white mb-2" />
                <span className="text-white font-medium">Changer l'image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onImageUpload}
                />
              </label>
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={onImageReposition}
              >
                <Move className="h-4 w-4 mr-2" />
                Repositionner
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 