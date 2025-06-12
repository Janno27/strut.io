import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface ModelImageModalProps {
  selectedImage: string | null
  selectedImageIndex: number
  modelName: string
  additionalImages: string[]
  imagesToDelete: string[]
  onClose: () => void
  onNext: (e: React.MouseEvent) => void
  onPrev: (e: React.MouseEvent) => void
}

export function ModelImageModal({
  selectedImage,
  selectedImageIndex,
  modelName,
  additionalImages,
  imagesToDelete,
  onClose,
  onNext,
  onPrev
}: ModelImageModalProps) {
  if (!selectedImage) return null

  const displayAdditionalImages = additionalImages.filter(img => !imagesToDelete.includes(img))

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl h-full max-h-[80vh] m-4">
        <Image
          src={selectedImage}
          alt={modelName}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
        
        {/* Boutons de navigation */}
        {displayAdditionalImages.length > 1 && (
          <>
            <button 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-opacity disabled:opacity-30"
              onClick={onPrev}
              disabled={selectedImageIndex <= 0}
            >
              <ChevronLeft className="h-8 w-8 text-white" />
            </button>
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-opacity disabled:opacity-30"
              onClick={onNext}
              disabled={selectedImageIndex >= displayAdditionalImages.length - 1}
            >
              <ChevronRight className="h-8 w-8 text-white" />
            </button>
          </>
        )}
        
        {/* Bouton fermer */}
        <button 
          className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-opacity"
          onClick={onClose}
        >
          <X className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  )
} 