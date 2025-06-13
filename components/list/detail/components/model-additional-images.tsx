import Image from "next/image"
import { Label } from "@/components/ui/label"
import { DraggableImageGrid } from "@/components/ui/draggable-image-grid"
import { FocalPoint } from "../types"

interface ModelAdditionalImagesProps {
  model: {
    name: string
    additionalImages?: string[]
    additional_images_focal_points?: Record<string, FocalPoint>
  }
  isEditing: boolean
  imagesToDelete: string[]
  getAllAdditionalImages: () => string[]
  onImageClick: (imageUrl: string, index: number) => void
  onImagesReorder: (newImages: string[]) => void
  onImageAdd: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove: (index: number) => void
  onImageReposition: (index: number) => void
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
  onImageReposition
}: ModelAdditionalImagesProps) {
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

  // Mode édition avec drag & drop
  return (
    <>
      <Label>Photos supplémentaires</Label>
      <DraggableImageGrid
        images={getAllAdditionalImages()}
        onImagesChange={onImagesReorder}
        onImageAdd={onImageAdd}
        onImageRemove={onImageRemove}
        onImageReposition={onImageReposition}
        allowMultiple={true}
        maxImages={10}
        focalPoints={model.additional_images_focal_points || {}}
      />
    </>
  )
} 