import { Label } from "@/components/ui/label"
import { MainImageUploader } from "@/components/ui/main-image-uploader"
import { DraggableImageGrid } from "@/components/ui/draggable-image-grid"
import { ModelImagesSectionProps } from "../types"

export function ModelImagesSection({
  mainImage,
  additionalImages,
  isLoading,
  onMainImageUpload,
  onMainImageRemove,
  onMainImageCrop,
  onAdditionalImageUpload,
  onAdditionalImageRemove,
  onAdditionalImagesReorder,
  onAdditionalImageCrop
}: ModelImagesSectionProps) {
  return (
    <div className="space-y-6">
      {/* Image principale */}
      <div className="space-y-2">
        <Label>Photo principale</Label>
        <MainImageUploader
          image={mainImage}
          onImageUpload={onMainImageUpload}
          onImageRemove={onMainImageRemove}
          onImageCrop={onMainImageCrop}
        />
      </div>

      {/* Images supplémentaires */}
      <div className="space-y-2">
        <Label>Photos supplémentaires</Label>
        <DraggableImageGrid
          images={additionalImages}
          onImagesChange={onAdditionalImagesReorder}
          onImageAdd={onAdditionalImageUpload}
          onImageRemove={onAdditionalImageRemove}
          onImageCrop={onAdditionalImageCrop}
          allowMultiple={true}
          maxImages={10}
        />
      </div>
    </div>
  )
} 