import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ModelDetailProps, FocalPoint, ImageGroups } from "../types"
import { useImageGroups } from "./use-image-groups"

interface UseImageManagementProps {
  model: ModelDetailProps['model']
  isEditing: boolean
  onModelUpdated?: () => void
}

export function useImageManagement({ model, isEditing, onModelUpdated }: UseImageManagementProps) {
  // Référence pour le nettoyage
  const cleanupRef = useRef<string[]>([])
  
  // États pour les images (ancien système)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  const [tempMainImage, setTempMainImage] = useState<string | null>(null)
  const [tempAdditionalImages, setTempAdditionalImages] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [imageOrder, setImageOrder] = useState<string[]>([])
  
  // États pour la visualisation des images
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1)
  
  // État pour le repositionnement d'image
  const [isPositionEditorOpen, setIsPositionEditorOpen] = useState(false)
  const [positionImageUrl, setPositionImageUrl] = useState("")
  const [positionImageType, setPositionImageType] = useState<"main" | "additional" | "group">("main")
  const [positionImageIndex, setPositionImageIndex] = useState<number>(-1)
  const [positionGroupId, setPositionGroupId] = useState<string>("")
  
  // États pour les focal points
  const [mainImageFocalPoint, setMainImageFocalPoint] = useState<FocalPoint | undefined>(model.main_image_focal_point)
  const [additionalImagesFocalPoints, setAdditionalImagesFocalPoints] = useState<Record<string, FocalPoint>>(
    model.additional_images_focal_points || {}
  )

  // Hook pour gérer les groupes d'images (nouveau système)
  const imageGroupsHook = useImageGroups({
    modelId: model.id,
    additionalImages: model.additionalImages,
    imageGroups: model.image_groups,
    additionalImagesFocalPoints: additionalImagesFocalPoints,
    isEditing
  })
  
  const supabase = createClient()
  
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
  
  // Initialisation des images et focal points
  useEffect(() => {
    if (model) {
      // Initialiser les images temporaires et l'ordre
      setTempMainImage(null)
      setTempAdditionalImages([])
      setImagesToDelete([])
      setImageOrder(model.additionalImages || [])
      
      // Initialiser les focal points depuis le modèle
      setMainImageFocalPoint(model.main_image_focal_point)
      setAdditionalImagesFocalPoints(model.additional_images_focal_points || {})
    }
  }, [model.id])

  // Nettoyage des URLs blob lors du démontage du composant
  useEffect(() => {
    return () => {
      // Nettoyer toutes les URLs blob créées au démontage
      if (cleanupRef.current.length > 0) {
        cleanupBlobUrls(cleanupRef.current)
        cleanupRef.current = []
      }
    }
  }, [])

  // Réinitialiser les images
  const resetImages = () => {
    // Nettoyer toutes les URLs blob avant de réinitialiser
    if (cleanupRef.current.length > 0) {
      cleanupBlobUrls(cleanupRef.current)
      cleanupRef.current = []
    }
    
    setTempMainImage(null)
    setTempAdditionalImages([])
    setMainImageFile(null)
    setAdditionalImageFiles([])
    setImagesToDelete([])
    setImageOrder(model.additionalImages || [])
    
    // Réinitialiser aussi les états de repositionnement
    setIsPositionEditorOpen(false)
    setPositionImageUrl("")
    setPositionImageType("main")
    setPositionImageIndex(-1)
    
    // Réinitialiser les focal points aux valeurs du modèle
    setMainImageFocalPoint(model.main_image_focal_point)
    setAdditionalImagesFocalPoints(model.additional_images_focal_points || {})
  }

  // Gestion de l'image principale
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Nettoyer l'ancienne URL blob si elle existe
      if (tempMainImage) {
        cleanupBlobUrls([tempMainImage])
        removeFromCleanup(tempMainImage)
      }
      
      setMainImageFile(file)
      const imageUrl = URL.createObjectURL(file)
      setTempMainImage(imageUrl)
      addToCleanup(imageUrl)
    }
  }

  const handleMainImageRemove = () => {
    // Nettoyer l'URL blob avant de supprimer
    if (tempMainImage) {
      cleanupBlobUrls([tempMainImage])
      removeFromCleanup(tempMainImage)
    }
    setTempMainImage(null)
    setMainImageFile(null)
  }

  // Gestion des images supplémentaires
  const handleAdditionalImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Valider le nombre total d'images
    const currentImageCount = (model.additionalImages?.length || 0) + tempAdditionalImages.length - imagesToDelete.length;
    const remainingSlots = 10 - currentImageCount; // Limite de 10 images
    
    if (files.length > remainingSlots) {
      console.warn(`Limite d'images atteinte. Seulement ${remainingSlots} images peuvent être ajoutées.`);
      // Prendre seulement le nombre d'images autorisé
      files.splice(remainingSlots);
    }
    
    const newImageUrls = files.map(file => {
      const url = URL.createObjectURL(file)
      addToCleanup(url)
      return url
    })
    
    setAdditionalImageFiles(prev => [...prev, ...files])
    setTempAdditionalImages(prev => [...prev, ...newImageUrls])
    
    // Ajouter les nouvelles images à l'ordre
    setImageOrder(prev => [...prev, ...newImageUrls])
    
    // Réinitialiser l'input
    e.target.value = ""
  }

  const handleAdditionalImageRemoveByIndex = (index: number) => {
    const allImages = getAllAdditionalImages()
    const imageToRemove = allImages[index]
    
    if (tempAdditionalImages.includes(imageToRemove)) {
      // Image temporaire - nettoyer l'URL blob
      const tempIndex = tempAdditionalImages.indexOf(imageToRemove)
      setTempAdditionalImages(prev => prev.filter((_, i) => i !== tempIndex))
      setAdditionalImageFiles(prev => prev.filter((_, i) => i !== tempIndex))
      cleanupBlobUrls([imageToRemove])
      removeFromCleanup(imageToRemove)
    } else if ((model.additionalImages || []).includes(imageToRemove)) {
      // Image existante de la BDD
      setImagesToDelete(prev => [...prev, imageToRemove])
    } else if (imageToRemove.startsWith('blob:')) {
      // Image blob orpheline - nettoyer directement
      cleanupBlobUrls([imageToRemove])
      removeFromCleanup(imageToRemove)
    }
    
    // Retirer de l'ordre
    setImageOrder(prev => prev.filter(img => img !== imageToRemove))
  }

  const handleAdditionalImagesReorder = (newImages: string[]) => {
    // Mettre à jour l'ordre complet des images
    setImageOrder(newImages.filter(img => !imagesToDelete.includes(img)))
    
    // Séparer les images existantes des temporaires dans le nouvel ordre
    const existingImages = newImages.filter(img => (model.additionalImages || []).includes(img))
    const tempImages = newImages.filter(img => tempAdditionalImages.includes(img))
    
    // Réorganiser les fichiers correspondants aux images temporaires
    const newFiles = tempImages.map(imageUrl => {
      const index = tempAdditionalImages.findIndex(img => img === imageUrl)
      return additionalImageFiles[index]
    }).filter(Boolean)
    
    // Mettre à jour les images temporaires dans le bon ordre
    setTempAdditionalImages(tempImages)
    setAdditionalImageFiles(newFiles)
  }

  // Créer la liste complète des images supplémentaires pour le drag & drop
  const getAllAdditionalImages = () => {
    // Si on a des groupes d'images, les utiliser en priorité
    if (imageGroupsHook.imageGroups && Object.keys(imageGroupsHook.imageGroups).length > 0) {
      const allImagesFromGroups: string[] = []
      
      // Parcourir tous les groupes dans l'ordre
      Object.keys(imageGroupsHook.imageGroups).forEach(groupId => {
        const group = imageGroupsHook.imageGroups[groupId]
        if (groupId === 'ungrouped') {
          const images = Array.isArray(group) ? group : []
          allImagesFromGroups.push(...images)
        } else if (group && !Array.isArray(group)) {
          allImagesFromGroups.push(...group.images)
        }
      })
      
      // Filtrer les images supprimées
      return allImagesFromGroups.filter(img => !imagesToDelete.includes(img))
    }
    
    // Sinon, utiliser l'ancien système avec l'ordre défini
    const orderedExistingImages = imageOrder.filter(img => 
      !imagesToDelete.includes(img) && 
      // Filtrer les URLs blob qui ne sont plus dans tempAdditionalImages
      (!img.startsWith('blob:') || tempAdditionalImages.includes(img))
    )
    const newTempImages = tempAdditionalImages.filter(img => !imageOrder.includes(img))
    return [...orderedExistingImages, ...newTempImages]
  }

  // Gestion du repositionnement d'images
  const handleMainImageReposition = () => {
    const currentMainImage = tempMainImage || model.imageUrl
    if (currentMainImage) {
      setPositionImageUrl(currentMainImage)
      setPositionImageType("main")
      setPositionImageIndex(-1)
      setIsPositionEditorOpen(true)
    }
  }

  const handleAdditionalImageReposition = (index: number) => {
    const allImages = getAllAdditionalImages()
    const imageUrl = allImages[index]
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
      const allImages = getAllAdditionalImages()
      const imageUrl = allImages[positionImageIndex]
      setAdditionalImagesFocalPoints(prev => ({
        ...prev,
        [imageUrl]: focalPoint
      }))
    } else if (positionImageType === "group") {
      // Gestion du repositionnement pour les groupes
      setAdditionalImagesFocalPoints(prev => ({
        ...prev,
        [positionImageUrl]: focalPoint
      }))
    }
    
    setIsPositionEditorOpen(false)
    setPositionImageUrl("")
    setPositionImageType("main")
    setPositionImageIndex(-1)
    setPositionGroupId("")
  }

  // Gestion de la modal d'image
  const handleImageClick = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl)
    setSelectedImageIndex(index)
  }

  const handleCloseImageModal = () => {
    setSelectedImage(null)
    setSelectedImageIndex(-1)
  }
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    const allImages = getAllAdditionalImages()
    if (selectedImageIndex < allImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
      setSelectedImage(allImages[selectedImageIndex + 1])
    }
  }
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    const allImages = getAllAdditionalImages()
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
      setSelectedImage(allImages[selectedImageIndex - 1])
    }
  }

  // Upload des nouvelles images
  const uploadNewImages = async () => {
    let newMainImageUrl = model.imageUrl;
    const newAdditionalImageUrls = [...(model.additionalImages || [])];
    
    // Télécharger la nouvelle image principale si elle existe
    if (mainImageFile) {
      const fileExt = mainImageFile.name.split('.').pop();
      const fileName = `${Date.now()}_main.${fileExt}`;
      const filePath = fileName;
      
      const { error: mainImageError } = await supabase.storage
        .from('models')
        .upload(filePath, mainImageFile);
        
      if (mainImageError) {
        throw new Error(`Erreur lors du téléchargement de l'image principale: ${mainImageError.message}`);
      }
      
      const { data: mainImageData } = supabase.storage.from('models').getPublicUrl(filePath);
      newMainImageUrl = mainImageData.publicUrl;
    }
    
    // Télécharger les nouvelles images supplémentaires
    for (let i = 0; i < additionalImageFiles.length; i++) {
      const file = additionalImageFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${i}.${fileExt}`;
      const filePath = fileName;
      
      const { error: additionalImageError } = await supabase.storage
        .from('models')
        .upload(filePath, file);
        
      if (additionalImageError) {
        throw new Error(`Erreur lors du téléchargement de l'image supplémentaire: ${additionalImageError.message}`);
      }
      
      const { data: additionalImageData } = supabase.storage.from('models').getPublicUrl(filePath);
      newAdditionalImageUrls.push(additionalImageData.publicUrl);
    }
    
    // Supprimer les images marquées pour suppression
    for (const imageUrl of imagesToDelete) {
      const filePath = imageUrl.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('models')
          .remove([filePath]);
          
        // Retirer l'URL de la liste des images supplémentaires
        const index = newAdditionalImageUrls.indexOf(imageUrl);
        if (index > -1) {
          newAdditionalImageUrls.splice(index, 1);
        }
      }
    }
    
    // Réorganiser selon l'ordre défini
    const finalOrderedImages = imageOrder
      .filter(img => !imagesToDelete.includes(img)) // Exclure les supprimées
      .map(img => {
        // Si c'est une image existante, garder l'URL
        if ((model.additionalImages || []).includes(img)) {
          return img;
        }
        // Si c'est une nouvelle image temporaire, utiliser la nouvelle URL
        const tempIndex = tempAdditionalImages.indexOf(img);
        if (tempIndex >= 0 && tempIndex < newAdditionalImageUrls.length - (model.additionalImages || []).length) {
          return newAdditionalImageUrls[(model.additionalImages || []).length + tempIndex];
        }
        return img;
      })
      .filter(Boolean);
    
    // Ajouter les nouvelles images qui ne sont pas dans l'ordre
    const remainingNewImages = newAdditionalImageUrls.filter(url => !finalOrderedImages.includes(url));
    const finalImageUrls = [...finalOrderedImages, ...remainingNewImages];
  
    return { newMainImageUrl, newAdditionalImageUrls: finalImageUrls };
  };

  // Sauvegarder les images et nettoyer
  const saveImagesAndCleanup = () => {
    // Nettoyer les URLs blob avant de réinitialiser
    const urlsToClean = [tempMainImage, ...tempAdditionalImages].filter((url): url is string => Boolean(url));
    cleanupBlobUrls(urlsToClean);
  }

  // Gestionnaires pour les groupes d'images
  const handleGroupImageReposition = (groupId: string, imageIndex: number) => {
    const repositionData = imageGroupsHook.handleImageReposition(groupId, imageIndex)
    if (repositionData.imageUrl) {
      setPositionImageUrl(repositionData.imageUrl)
      setPositionImageType("group")
      setPositionImageIndex(imageIndex)
      setPositionGroupId(groupId)
      setIsPositionEditorOpen(true)
    }
  }

  // Ajouter une URL à la liste de nettoyage
  const addToCleanup = (url: string) => {
    if (url && url.startsWith('blob:') && !cleanupRef.current.includes(url)) {
      cleanupRef.current.push(url)
    }
  }

  // Supprimer une URL de la liste de nettoyage
  const removeFromCleanup = (url: string) => {
    cleanupRef.current = cleanupRef.current.filter(u => u !== url)
  }

  return {
    // États des images (ancien système)
    mainImageFile,
    additionalImageFiles,
    tempMainImage,
    tempAdditionalImages,
    imagesToDelete,
    imageOrder,
    
    // États de visualisation
    selectedImage,
    selectedImageIndex,
    
    // États de repositionnement
    isPositionEditorOpen,
    positionImageUrl,
    positionImageType,
    positionImageIndex,
    positionGroupId,
    
    // États des focal points
    mainImageFocalPoint,
    additionalImagesFocalPoints,
    
    // Actions principales
    resetImages,
    uploadNewImages,
    saveImagesAndCleanup,
    getAllAdditionalImages,
    
    // Actions image principale
    handleMainImageUpload,
    handleMainImageRemove,
    handleMainImageReposition,
    
    // Actions images supplémentaires (ancien système)
    handleAdditionalImageAdd,
    handleAdditionalImageRemoveByIndex,
    handleAdditionalImagesReorder,
    handleAdditionalImageReposition,
    
    // Actions repositionnement
    handlePositionComplete,
    setIsPositionEditorOpen,
    
    // Actions modal image
    handleImageClick,
    handleCloseImageModal,
    handleNextImage,
    handlePrevImage,
    
    // Actions pour les groupes d'images (nouveau système)
    imageGroups: imageGroupsHook.imageGroups,
    setImageGroups: imageGroupsHook.setImageGroups,
    handleGroupImageAdd: imageGroupsHook.handleImageAdd,
    handleGroupImageRemove: imageGroupsHook.handleImageRemove,
    handleGroupImageReposition,
    uploadGroupImages: imageGroupsHook.uploadNewImages,
    getGroupsForSave: imageGroupsHook.getGroupsForSave,
    resetImageGroups: imageGroupsHook.resetImageGroups,
  }
} 