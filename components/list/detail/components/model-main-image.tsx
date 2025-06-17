import { Button } from "@/components/ui/button"
import { Upload, X, Move } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { FocalPoint, ImageGroups } from "../types"
import { getMainImageFromGroups } from "@/lib/utils/image-utils"

interface ModelMainImageProps {
  name: string
  isEditing: boolean
  imageGroups?: ImageGroups
  additionalImages?: string[]
  imageUrl?: string // Garde pour compatibilité
  tempMainImage?: string | null
  focalPoint?: FocalPoint
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove?: () => void
  onImageReposition?: () => void
}

export function ModelMainImage({
  name,
  isEditing,
  imageGroups,
  additionalImages,
  imageUrl,
  tempMainImage,
  focalPoint,
  onImageUpload,
  onImageRemove,
  onImageReposition
}: ModelMainImageProps) {
  // Récupérer l'image principale automatiquement
  const mainImageUrl = getMainImageFromGroups(imageGroups, additionalImages) || imageUrl || ""
  
  if (!isEditing) {
    // Mode affichage - Format uniforme pour la grille avec focal point
    const objectPosition = focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center'
    
    // Si pas d'image principale, ne rien afficher
    if (!mainImageUrl) {
      return (
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          <p className="text-gray-500 text-sm">Aucune image</p>
        </div>
      )
    }
    
    return (
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <OptimizedImage
          src={mainImageUrl}
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

  // Mode édition - Affichage simple de l'image principale automatique
  return (
    <div className="relative aspect-square">
      {mainImageUrl ? (
        <div className="relative">
          <OptimizedImage
            src={mainImageUrl}
            alt={name}
            fill
            className="object-cover"
            objectPosition={focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center'}
            sizes="(max-width: 768px) 100vw, 50vw"
            cacheWidth={600}
            cacheHeight={600}
          />
          
          {/* Indicateur que c'est automatique */}
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Auto
          </div>
          
          {/* Bouton repositionner si disponible */}
          {onImageReposition && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-white/20 hover:bg-white/30"
              onClick={onImageReposition}
              title="Repositionner l'image"
            >
              <Move className="h-4 w-4 text-white" />
            </Button>
          )}
        </div>
      ) : (
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
          <div className="text-center p-4">
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500 mb-1">Image principale automatique</p>
            <p className="text-xs text-gray-400">Ajoutez des images dans les groupes ci-dessous</p>
          </div>
        </div>
      )}
    </div>
  )
} 