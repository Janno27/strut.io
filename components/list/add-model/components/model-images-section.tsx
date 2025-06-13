import { Label } from "@/components/ui/label"
import { MainImageUploader } from "@/components/ui/main-image-uploader"
import { DraggableImageGrid } from "@/components/ui/draggable-image-grid"
import { ModelImagesSectionProps } from "../types"

export function ModelImagesSection({
  mainImage,
  additionalImages,
  mainImageFocalPoint,
  additionalImagesFocalPoints,
  isLoading,
  onMainImageUpload,
  onMainImageRemove,
  onMainImageReposition,
  onAdditionalImageUpload,
  onAdditionalImageRemove,
  onAdditionalImagesReorder,
  onAdditionalImageReposition
}: ModelImagesSectionProps) {
  return (
    <div className="space-y-6">
      {/* Image principale */}
      <div className="space-y-2">
        <Label>Photo principale</Label>
        <MainImageUploader
          image={mainImage}
          focalPoint={mainImageFocalPoint}
          onImageUpload={onMainImageUpload}
          onImageRemove={onMainImageRemove}
          onImageReposition={onMainImageReposition}
        />
      </div>

      {/* Images supplémentaires */}
      <div className="space-y-2">
        <Label>Photos supplémentaires</Label>
        <DraggableImageGrid
          images={additionalImages}
          focalPoints={additionalImagesFocalPoints}
          onImagesChange={onAdditionalImagesReorder}
          onImageAdd={onAdditionalImageUpload}
          onImageRemove={onAdditionalImageRemove}
          onImageReposition={onAdditionalImageReposition}
          allowMultiple={true}
          maxImages={10}
        />
      </div>
    </div>
  )
} 