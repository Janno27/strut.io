import { useState } from "react"
import { toast } from "sonner"
import { validateAndProcessImage } from "../utils/model-utils"
import { validateAndCompressImage } from "@/lib/services/image-compression"
import { FocalPoint } from "../types"

export function useModelImages() {
  // État pour les images (plus de gestion d'image principale)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  
  // État pour le repositionnement d'image
  const [isPositionEditorOpen, setIsPositionEditorOpen] = useState(false)
  const [positionImageUrl, setPositionImageUrl] = useState("")
  const [positionImageType, setPositionImageType] = useState<"additional">("additional")
  const [positionImageIndex, setPositionImageIndex] = useState<number>(-1)
  
  // États pour les focal points (plus de focal point pour l'image principale)
  const [additionalImagesFocalPoints, setAdditionalImagesFocalPoints] = useState<Record<string, FocalPoint>>({})

  // Fonction pour nettoyer les URLs blob
  const cleanupBlobUrls = (urls: string[]) => {
    urls.forEach(url => {
      if (url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn('Erreur lors du nettoyage de l\'URL blob:', error);
        }
      }
    });
  };

  // Télécharger des images (maintenant toutes gérées comme images supplémentaires)
  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      try {
        // Convertir FileList en Array pour pouvoir itérer dessus
        const filesArray = Array.from(files)
        
        // Vérifier la limite d'images (max 10 images)
        const currentCount = additionalImageFiles.length
        const maxImages = 10
        const remainingSlots = maxImages - currentCount
        
        if (filesArray.length > remainingSlots) {
          toast.warning(`Limite atteinte. Seulement ${remainingSlots} images peuvent être ajoutées.`)
          filesArray.splice(remainingSlots)
        }
        
        // Traiter chaque fichier en parallèle
        const fileProcessingPromises = filesArray.map(async (file, index) => {
          try {
            const result = await validateAndCompressImage(file, false) // false pour images supplémentaires
            return { index, result, originalSize: file.size }
          } catch (error) {
            console.error(`Erreur lors du traitement de l'image ${index + 1}:`, error)
            return { index, result: { isValid: false, error: 'Erreur de traitement' }, originalSize: file.size }
          }
        })
        
        const processedFiles = await Promise.all(fileProcessingPromises)
        
        // Séparer les fichiers valides et les erreurs
        const validFiles: File[] = []
        const errors: string[] = []
        let totalCompressionInfo = { originalSize: 0, compressedSize: 0, count: 0 }
        
        processedFiles.forEach(({ index, result, originalSize }) => {
          if (result.isValid && result.file) {
            validFiles.push(result.file)
            totalCompressionInfo.originalSize += originalSize
            totalCompressionInfo.compressedSize += result.file.size
            totalCompressionInfo.count++
          } else {
            errors.push(`Image ${index + 1}: ${result.error}`)
          }
        })
        
        // Afficher les erreurs s'il y en a
        if (errors.length > 0) {
          toast.error(`Erreurs de validation:\n${errors.join('\n')}`)
        }
        
        if (validFiles.length > 0) {
          // Ajouter les nouveaux fichiers à la liste existante
          const newFiles = [...additionalImageFiles, ...validFiles]
          setAdditionalImageFiles(newFiles)
          
          // Créer les URLs pour l'aperçu
          const newImageUrls = validFiles.map(file => URL.createObjectURL(file))
          setAdditionalImages(prev => [...prev, ...newImageUrls])
          
          // Afficher les informations de compression globales
          if (totalCompressionInfo.count > 0) {
            const compressionRatio = ((totalCompressionInfo.originalSize - totalCompressionInfo.compressedSize) / totalCompressionInfo.originalSize) * 100
            if (compressionRatio > 5) {
              toast.success(`${totalCompressionInfo.count} images compressées (${compressionRatio.toFixed(1)}% de réduction)`)
            }
          }
        }
        
        // Réinitialiser l'input de fichier
        e.target.value = ""
      } catch (error) {
        console.error('Erreur lors du traitement des images:', error)
        toast.error('Erreur lors du traitement des images')
      }
    }
  }

  // Supprimer une image
  const handleAdditionalImageRemove = (index: number) => {
    const imageToRemove = additionalImages[index]
    
    // Libérer l'URL de l'objet pour éviter les fuites de mémoire
    cleanupBlobUrls([imageToRemove])
    
    // Supprimer le focal point associé
    setAdditionalImagesFocalPoints(prev => {
      const newFocalPoints = { ...prev }
      delete newFocalPoints[imageToRemove]
      return newFocalPoints
    })
    
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Réorganiser les images
  const handleAdditionalImagesReorder = (newImages: string[]) => {
    // Créer un nouvel ordre pour les fichiers basé sur l'ordre des URLs
    const newFiles = newImages.map(imageUrl => {
      const index = additionalImages.findIndex(img => img === imageUrl)
      return additionalImageFiles[index]
    }).filter(Boolean)
    
    setAdditionalImages(newImages)
    setAdditionalImageFiles(newFiles)
  }

  // Gestion du repositionnement d'images
  const handleAdditionalImageReposition = (index: number) => {
    const imageUrl = additionalImages[index]
    if (imageUrl) {
      setPositionImageUrl(imageUrl)
      setPositionImageType("additional")
      setPositionImageIndex(index)
      setIsPositionEditorOpen(true)
    }
  }

  const handlePositionComplete = (focalPoint: FocalPoint) => {
    if (positionImageType === "additional") {
      const imageUrl = additionalImages[positionImageIndex]
      setAdditionalImagesFocalPoints(prev => ({
        ...prev,
        [imageUrl]: focalPoint
      }))
    }
    
    setIsPositionEditorOpen(false)
    setPositionImageUrl("")
    setPositionImageType("additional")
    setPositionImageIndex(-1)
  }

  // Réinitialiser les images
  const resetImages = () => {
    // Nettoyer toutes les URLs blob pour éviter les fuites mémoire
    const urlsToClean = additionalImages.filter((url): url is string => Boolean(url));
    cleanupBlobUrls(urlsToClean);
    
    setAdditionalImages([])
    setAdditionalImageFiles([])
    
    // Réinitialiser aussi les états de repositionnement
    setIsPositionEditorOpen(false)
    setPositionImageUrl("")
    setPositionImageType("additional")
    setPositionImageIndex(-1)
    
    // Réinitialiser les focal points
    setAdditionalImagesFocalPoints({})
  }

  return {
    // Plus d'états pour l'image principale
    additionalImages,
    additionalImageFiles,
    additionalImagesFocalPoints,
    
    // Handlers d'upload (plus de handler pour image principale)
    handleAdditionalImageUpload,
    handleAdditionalImageRemove,
    handleAdditionalImagesReorder,
    
    // Repositionnement (plus de repositionnement pour image principale)
    isPositionEditorOpen,
    positionImageUrl,
    positionImageType,
    positionImageIndex,
    handleAdditionalImageReposition,
    handlePositionComplete,
    
    // Utilitaires
    resetImages,
    cleanupBlobUrls
  }
} 