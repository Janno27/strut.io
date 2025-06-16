import Image from "next/image"
import { Label } from "@/components/ui/label"
import { ImageGroupsManager } from "./image-groups-manager"
import { FocalPoint, ImageGroups } from "../types"

interface ModelAdditionalImagesProps {
  model: {
    name: string
    additionalImages?: string[]
    additional_images_focal_points?: Record<string, FocalPoint>
    image_groups?: ImageGroups
  }
  isEditing: boolean
  imagesToDelete: string[]
  getAllAdditionalImages: () => string[]
  onImageClick: (imageUrl: string, index: number) => void
  onImagesReorder: (newImages: string[]) => void
  onImageAdd: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove: (index: number) => void
  onImageReposition: (index: number) => void
  // Nouvelles props pour les groupes
  onImageGroupsChange?: (newGroups: ImageGroups) => void
  onGroupImageAdd?: (groupId: string, e: React.ChangeEvent<HTMLInputElement>) => void
  onGroupImageRemove?: (groupId: string, imageIndex: number) => void
  onGroupImageReposition?: (groupId: string, imageIndex: number) => void
}

export function ModelAdditionalImages({
  model,
  isEditing,
  imagesToDelete,
  getAllAdditionalImages,
  onImageClick,
  onImagesReorder,
  onImageAdd,
  onImageRemove,
  onImageReposition,
  onImageGroupsChange,
  onGroupImageAdd,
  onGroupImageRemove,
  onGroupImageReposition
}: ModelAdditionalImagesProps) {
  // Si on utilise le nouveau système de groupes
  if (model.image_groups && onImageGroupsChange && onGroupImageAdd && onGroupImageRemove && onGroupImageReposition) {
    return (
      <div className="space-y-2">
        {isEditing && <Label>Photos supplémentaires</Label>}
        <ImageGroupsManager
          imageGroups={model.image_groups}
          focalPoints={model.additional_images_focal_points || {}}
          isEditing={isEditing}
          onImageGroupsChange={onImageGroupsChange}
          onImageAdd={onGroupImageAdd}
          onImageRemove={onGroupImageRemove}
          onImageReposition={onGroupImageReposition}
          onImageClick={onImageClick}
        />
      </div>
    )
  }

  // Ancien système (rétrocompatibilité)
  if (!isEditing) {
    // Mode affichage
    const displayAdditionalImages = (model.additionalImages || []).filter(img => !imagesToDelete.includes(img))
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {displayAdditionalImages.map((imageUrl, index) => {
          const focalPoint = model.additional_images_focal_points?.[imageUrl]
          const objectPosition = focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center'
          
          return (
            <div 
              key={index} 
              className="rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-100 dark:bg-gray-800"
              onClick={() => onImageClick(imageUrl, index)}
            >
              <div className="relative aspect-square">
                <Image
                  src={imageUrl}
                  alt={`${model.name} - photo ${index + 1}`}
                  fill
                  className="object-cover"
                  style={{ objectPosition }}
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Mode édition avec l'ancien système - pas de drag & drop pour le moment
  return (
    <div className="space-y-2">
      <Label>Photos supplémentaires</Label>
      <p className="text-sm text-gray-500">
        Mode édition de l'ancien système. Utilisez le nouveau système de groupes pour plus de fonctionnalités.
      </p>
    </div>
  )
} 