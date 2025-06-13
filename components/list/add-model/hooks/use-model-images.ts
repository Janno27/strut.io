import { useState } from "react"
import { toast } from "sonner"
import { validateAndProcessImage } from "../utils/model-utils"
import { FocalPoint } from "../types"

export function useModelImages() {
  // État pour les images
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  
  // État pour le repositionnement d'image
  const [isPositionEditorOpen, setIsPositionEditorOpen] = useState(false)
  const [positionImageUrl, setPositionImageUrl] = useState("")
  const [positionImageType, setPositionImageType] = useState<"main" | "additional">("main")
  const [positionImageIndex, setPositionImageIndex] = useState<number>(-1)
  
  // États pour les focal points
  const [mainImageFocalPoint, setMainImageFocalPoint] = useState<FocalPoint | undefined>(undefined)
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

  // Télécharger l'image principale
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateAndProcessImage(file);
      if (!validation.isValid) {
        toast.error(validation.error || "Erreur de validation de l'image");
        return;
      }
      
      // Nettoyer l'ancienne URL blob si elle existe
      if (mainImage) {
        cleanupBlobUrls([mainImage]);
      }
      
      setMainImageFile(file)
      const imageUrl = URL.createObjectURL(file)
      setMainImage(imageUrl)
    }
  }

  // Supprimer l'image principale
  const handleMainImageRemove = () => {
    // Nettoyer l'URL blob avant de supprimer
    if (mainImage) {
      cleanupBlobUrls([mainImage]);
    }
    setMainImage(null)
    setMainImageFile(null)
    setMainImageFocalPoint(undefined)
  }

  // Télécharger des images supplémentaires (multiple)
  const handleAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Convertir FileList en Array pour pouvoir itérer dessus
      const filesArray = Array.from(files)
      
      // Valider chaque fichier
      const validFiles: File[] = [];
      const errors: string[] = [];
      
      filesArray.forEach((file, index) => {
        const validation = validateAndProcessImage(file);
        if (validation.isValid) {
          validFiles.push(file);
        } else {
          errors.push(`Image ${index + 1}: ${validation.error}`);
        }
      });
      
      // Afficher les erreurs s'il y en a
      if (errors.length > 0) {
        toast.error(`Erreurs de validation:\n${errors.join('\n')}`);
      }
      
      // Vérifier la limite d'images (max 10 images supplémentaires)
      const currentCount = additionalImageFiles.length;
      const maxAdditional = 10;
      const remainingSlots = maxAdditional - currentCount;
      
      if (validFiles.length > remainingSlots) {
        toast.warning(`Limite atteinte. Seulement ${remainingSlots} images supplémentaires peuvent être ajoutées.`);
        validFiles.splice(remainingSlots);
      }
      
      if (validFiles.length > 0) {
        // Ajouter les nouveaux fichiers à la liste existante
        const newFiles = [...additionalImageFiles, ...validFiles]
        setAdditionalImageFiles(newFiles)
        
        // Créer les URLs pour l'aperçu
        const newImageUrls = validFiles.map(file => URL.createObjectURL(file))
        setAdditionalImages(prev => [...prev, ...newImageUrls])
      }
      
      // Réinitialiser l'input de fichier pour permettre de sélectionner les mêmes fichiers à nouveau si nécessaire
      e.target.value = ""
    }
  }

  // Supprimer une image supplémentaire
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

  // Réorganiser les images supplémentaires
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
  const handleMainImageReposition = () => {
    if (mainImage) {
      setPositionImageUrl(mainImage)
      setPositionImageType("main")
      setPositionImageIndex(-1)
      setIsPositionEditorOpen(true)
    }
  }

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
    if (positionImageType === "main") {
      setMainImageFocalPoint(focalPoint)
    } else if (positionImageType === "additional") {
      const imageUrl = additionalImages[positionImageIndex]
      setAdditionalImagesFocalPoints(prev => ({
        ...prev,
        [imageUrl]: focalPoint
      }))
    }
    
    setIsPositionEditorOpen(false)
    setPositionImageUrl("")
    setPositionImageType("main")
    setPositionImageIndex(-1)
  }

  // Réinitialiser les images
  const resetImages = () => {
    // Nettoyer toutes les URLs blob pour éviter les fuites mémoire
    const urlsToClean = [mainImage, ...additionalImages].filter((url): url is string => Boolean(url));
    cleanupBlobUrls(urlsToClean);
    
    setMainImage(null)
    setAdditionalImages([])
    setMainImageFile(null)
    setAdditionalImageFiles([])
    
    // Réinitialiser aussi les états de repositionnement
    setIsPositionEditorOpen(false)
    setPositionImageUrl("")
    setPositionImageType("main")
    setPositionImageIndex(-1)
    
    // Réinitialiser les focal points
    setMainImageFocalPoint(undefined)
    setAdditionalImagesFocalPoints({})
  }

  return {
    // États des images
    mainImage,
    additionalImages,
    mainImageFile,
    additionalImageFiles,
    
    // États de repositionnement
    isPositionEditorOpen,
    positionImageUrl,
    positionImageType,
    positionImageIndex,
    
    // États des focal points
    mainImageFocalPoint,
    additionalImagesFocalPoints,
    
    // Actions
    handleMainImageUpload,
    handleMainImageRemove,
    handleAdditionalImageUpload,
    handleAdditionalImageRemove,
    handleAdditionalImagesReorder,
    handleMainImageReposition,
    handleAdditionalImageReposition,
    handlePositionComplete,
    setIsPositionEditorOpen,
    resetImages,
  }
} 