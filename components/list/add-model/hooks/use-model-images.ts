import { useState } from "react"
import { toast } from "sonner"
import { validateAndProcessImage } from "../utils/model-utils"

export function useModelImages() {
  // État pour les images
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  
  // État pour le recadrage
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [cropImageUrl, setCropImageUrl] = useState("")
  const [cropImageType, setCropImageType] = useState<"main" | "additional">("main")
  const [cropImageIndex, setCropImageIndex] = useState<number>(-1)

  // Télécharger l'image principale
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateAndProcessImage(file);
      if (!validation.isValid) {
        toast.error(validation.error || "Erreur de validation de l'image");
        return;
      }
      
      setMainImageFile(file)
      const imageUrl = URL.createObjectURL(file)
      setMainImage(imageUrl)
    }
  }

  // Supprimer l'image principale
  const handleMainImageRemove = () => {
    if (mainImage) {
      URL.revokeObjectURL(mainImage)
    }
    setMainImage(null)
    setMainImageFile(null)
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
    // Libérer l'URL de l'objet pour éviter les fuites de mémoire
    URL.revokeObjectURL(additionalImages[index])
    
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

  // Ouvrir le recadreur pour l'image principale
  const handleMainImageCrop = () => {
    if (mainImage) {
      setCropImageUrl(mainImage)
      setCropImageType("main")
      setCropImageIndex(-1)
      setIsCropperOpen(true)
    }
  }

  // Ouvrir le recadreur pour une image supplémentaire
  const handleAdditionalImageCrop = (index: number) => {
    if (additionalImages[index]) {
      setCropImageUrl(additionalImages[index])
      setCropImageType("additional")
      setCropImageIndex(index)
      setIsCropperOpen(true)
    }
  }

  // Gérer la completion du recadrage
  const handleCropComplete = (croppedImageFile: File) => {
    const imageUrl = URL.createObjectURL(croppedImageFile)
    
    if (cropImageType === "main") {
      // Libérer l'ancienne URL si elle existe
      if (mainImage) {
        URL.revokeObjectURL(mainImage)
      }
      setMainImage(imageUrl)
      setMainImageFile(croppedImageFile)
    } else if (cropImageType === "additional" && cropImageIndex >= 0) {
      // Libérer l'ancienne URL
      URL.revokeObjectURL(additionalImages[cropImageIndex])
      
      // Mettre à jour l'image et le fichier
      const newImages = [...additionalImages]
      const newFiles = [...additionalImageFiles]
      newImages[cropImageIndex] = imageUrl
      newFiles[cropImageIndex] = croppedImageFile
      
      setAdditionalImages(newImages)
      setAdditionalImageFiles(newFiles)
    }
    
    setIsCropperOpen(false)
  }

  // Réinitialiser les images
  const resetImages = () => {
    // Nettoyer les URLs blob
    if (mainImage) {
      URL.revokeObjectURL(mainImage)
    }
    additionalImages.forEach(url => URL.revokeObjectURL(url))
    
    setMainImage(null)
    setAdditionalImages([])
    setMainImageFile(null)
    setAdditionalImageFiles([])
  }

  return {
    // États
    mainImage,
    additionalImages,
    mainImageFile,
    additionalImageFiles,
    isCropperOpen,
    cropImageUrl,
    cropImageType,
    cropImageIndex,
    
    // Actions
    handleMainImageUpload,
    handleMainImageRemove,
    handleAdditionalImageUpload,
    handleAdditionalImageRemove,
    handleAdditionalImagesReorder,
    handleMainImageCrop,
    handleAdditionalImageCrop,
    handleCropComplete,
    setIsCropperOpen,
    resetImages,
  }
} 