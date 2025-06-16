import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useEffect, useRef } from "react"

interface ModelImageModalProps {
  selectedImage: string | null
  selectedImageIndex: number
  modelName: string
  additionalImages: string[]
  imagesToDelete: string[]
  onClose: () => void
  onNext: (e: React.MouseEvent) => void
  onPrev: (e: React.MouseEvent) => void
  getAllImages?: () => string[]
}

export function ModelImageModal({
  selectedImage,
  selectedImageIndex,
  modelName,
  additionalImages,
  imagesToDelete,
  onClose,
  onNext,
  onPrev,
  getAllImages
}: ModelImageModalProps) {
  if (!selectedImage) return null

  // Calculer les images directement
  const allImages = getAllImages ? getAllImages() : additionalImages
  const displayImages = allImages.filter(img => !imagesToDelete.includes(img))
  const totalImages = displayImages.length
  
  // Trouver l'index actuel dans les images affichées
  const currentDisplayIndex = displayImages.findIndex(img => img === selectedImage)

  // Utiliser des refs pour éviter les problèmes de dépendances
  const currentDisplayIndexRef = useRef(currentDisplayIndex)
  const totalImagesRef = useRef(totalImages)
  const onNextRef = useRef(onNext)
  const onPrevRef = useRef(onPrev)
  const onCloseRef = useRef(onClose)

  // Mettre à jour les refs
  currentDisplayIndexRef.current = currentDisplayIndex
  totalImagesRef.current = totalImages
  onNextRef.current = onNext
  onPrevRef.current = onPrev
  onCloseRef.current = onClose

  // Gestion des touches du clavier avec des dépendances stables
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (currentDisplayIndexRef.current >= 0 && currentDisplayIndexRef.current < totalImagesRef.current - 1) {
          const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent
          onNextRef.current(fakeEvent)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentDisplayIndexRef.current > 0) {
          const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent
          onPrevRef.current(fakeEvent)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, []) // Dépendances vides - stable

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
        {displayImages.length > 1 && (
          <>
            <button 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-opacity disabled:opacity-30"
              onClick={onPrev}
              disabled={currentDisplayIndex <= 0}
            >
              <ChevronLeft className="h-8 w-8 text-white" />
            </button>
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-opacity disabled:opacity-30"
              onClick={onNext}
              disabled={currentDisplayIndex >= displayImages.length - 1}
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

        {/* Indicateur de position */}
        {displayImages.length > 1 && currentDisplayIndex >= 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-full px-3 py-1">
            <span className="text-white text-sm">
              {currentDisplayIndex + 1} / {displayImages.length}
            </span>
          </div>
        )}
      </div>
    </div>
  )
} 