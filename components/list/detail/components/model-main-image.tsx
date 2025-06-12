import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface ModelMainImageProps {
  imageUrl: string
  name: string
  isEditing: boolean
  tempMainImage?: string | null
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove?: () => void
  onImageCrop: () => void
}

export function ModelMainImage({
  imageUrl,
  name,
  isEditing,
  tempMainImage,
  onImageUpload,
  onImageRemove,
  onImageCrop
}: ModelMainImageProps) {
  if (!isEditing) {
    // Mode affichage
    return (
      <div className="relative aspect-square">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
    )
  }

  // Mode édition
  return (
    <div className="relative aspect-square">
      {tempMainImage ? (
        <>
          <Image
            src={tempMainImage}
            alt="Nouvelle image principale"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
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
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
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
                onClick={onImageCrop}
              >
                Recadrer l'image
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 