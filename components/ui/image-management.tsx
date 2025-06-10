"use client"

import { Label } from "@/components/ui/label"
import { DraggableImageGrid } from "./draggable-image-grid"
import { MainImageUploader } from "./main-image-uploader"

interface ImageManagementProps {
  // Image principale
  mainImage: string | null
  onMainImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onMainImageRemove: () => void
  onMainImageEdit?: () => void
  
  // Images supplémentaires
  additionalImages: string[]
  onAdditionalImagesChange: (images: string[]) => void
  onAdditionalImageAdd: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAdditionalImageRemove: (index: number) => void
  
  // Options
  maxAdditionalImages?: number
  showMainImage?: boolean
  showAdditionalImages?: boolean
  className?: string
}

export function ImageManagement({
  mainImage,
  onMainImageUpload,
  onMainImageRemove,
  onMainImageEdit,
  additionalImages,
  onAdditionalImagesChange,
  onAdditionalImageAdd,
  onAdditionalImageRemove,
  maxAdditionalImages = 10,
  showMainImage = true,
  showAdditionalImages = true,
  className = ""
}: ImageManagementProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {showMainImage && (
        <div className="space-y-2">
          <Label>Photo principale</Label>
          <MainImageUploader
            image={mainImage}
            onImageUpload={onMainImageUpload}
            onImageRemove={onMainImageRemove}
            onImageEdit={onMainImageEdit}
          />
        </div>
      )}
      
      {showAdditionalImages && (
        <div className="space-y-2">
          <Label>Photos supplémentaires</Label>
          <DraggableImageGrid
            images={additionalImages}
            onImagesChange={onAdditionalImagesChange}
            onImageAdd={onAdditionalImageAdd}
            onImageRemove={onAdditionalImageRemove}
            allowMultiple={true}
            maxImages={maxAdditionalImages}
          />
        </div>
      )}
    </div>
  )
} 