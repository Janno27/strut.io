"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ImageGroups, ImageGroup, FocalPoint } from "../types"
import { validateAndCompressImage } from "@/lib/services/image-compression"
import { toast } from "sonner"

interface UseImageGroupsProps {
  modelId: string
  additionalImages?: string[]
  imageGroups?: ImageGroups
  additionalImagesFocalPoints?: Record<string, FocalPoint>
  isEditing: boolean
}

export function useImageGroups({ 
  modelId, 
  additionalImages = [], 
  imageGroups: initialImageGroups, 
  additionalImagesFocalPoints = {},
  isEditing 
}: UseImageGroupsProps) {
  // État des groupes d'images
  const [imageGroups, setImageGroups] = useState<ImageGroups>(() => {
    // Si on a déjà des groupes, les utiliser
    if (initialImageGroups) {
      return initialImageGroups
    }
    
    // Sinon, créer la structure initiale avec les images existantes
    if (additionalImages.length > 0) {
      return { ungrouped: additionalImages }
    }
    
    // Structure vide
    return { ungrouped: [] }
  })

  // Mettre à jour les groupes quand les données du modèle changent
  useEffect(() => {
    if (initialImageGroups) {
      setImageGroups(initialImageGroups)
    } else if (additionalImages.length > 0) {
      setImageGroups({ ungrouped: additionalImages })
    } else {
      setImageGroups({ ungrouped: [] })
    }
  }, [initialImageGroups, additionalImages])

  // États pour les nouvelles images temporaires
  const [tempImageFiles, setTempImageFiles] = useState<Record<string, File[]>>({})
  const [tempImageUrls, setTempImageUrls] = useState<Record<string, string[]>>({})
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  const supabase = createClient()

  // Nettoyer les URLs blob
  const cleanupBlobUrls = (urls: string[]) => {
    urls.forEach(url => {
      if (url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url)
        } catch (error) {
          console.warn('Erreur lors du nettoyage de l\'URL blob:', error)
        }
      }
    })
  }

  // Ajouter des images à un groupe
  const handleImageAdd = async (groupId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    try {
      // Traiter chaque fichier en parallèle
      const fileProcessingPromises = files.map(async (file, index) => {
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
        // Créer les URLs temporaires pour les fichiers valides
        const newImageUrls = validFiles.map(file => URL.createObjectURL(file))

        // Ajouter les fichiers temporaires
        setTempImageFiles(prev => ({
          ...prev,
          [groupId]: [...(prev[groupId] || []), ...validFiles]
        }))

        // Ajouter les URLs temporaires
        setTempImageUrls(prev => ({
          ...prev,
          [groupId]: [...(prev[groupId] || []), ...newImageUrls]
        }))

        // Ajouter les images au groupe
        setImageGroups(prev => {
          const group = prev[groupId]
          
          if (groupId === 'ungrouped') {
            const currentImages = Array.isArray(group) ? group : []
            return {
              ...prev,
              ungrouped: [...currentImages, ...newImageUrls]
            }
          } else {
            const currentGroup = (group && !Array.isArray(group)) ? group : { name: "Nouveau groupe", images: [] }
            return {
              ...prev,
              [groupId]: {
                ...currentGroup,
                images: [...currentGroup.images, ...newImageUrls]
              }
            }
          }
        })
        
        // Afficher les informations de compression globales
        if (totalCompressionInfo.count > 0) {
          const compressionRatio = ((totalCompressionInfo.originalSize - totalCompressionInfo.compressedSize) / totalCompressionInfo.originalSize) * 100
          if (compressionRatio > 5) {
            toast.success(`${totalCompressionInfo.count} images compressées (${compressionRatio.toFixed(1)}% de réduction)`)
          }
        }
      }

      // Réinitialiser l'input
      e.target.value = ""
    } catch (error) {
      console.error('Erreur lors du traitement des images:', error)
      toast.error('Erreur lors du traitement des images')
    }
  }

  // Supprimer une image d'un groupe
  const handleImageRemove = (groupId: string, imageIndex: number) => {
    const group = imageGroups[groupId]
    const images = groupId === 'ungrouped' 
      ? (Array.isArray(group) ? group : [])
      : ((group && !Array.isArray(group)) ? group.images : [])
    
    const imageToRemove = images[imageIndex]
    if (!imageToRemove) return

    // Si c'est une image temporaire, nettoyer l'URL blob
    const tempUrls = tempImageUrls[groupId] || []
    if (tempUrls.includes(imageToRemove)) {
      cleanupBlobUrls([imageToRemove])
      
      // Supprimer des fichiers temporaires
      const tempIndex = tempUrls.indexOf(imageToRemove)
      setTempImageFiles(prev => ({
        ...prev,
        [groupId]: (prev[groupId] || []).filter((_, i) => i !== tempIndex)
      }))
      
      // Supprimer des URLs temporaires
      setTempImageUrls(prev => ({
        ...prev,
        [groupId]: tempUrls.filter(url => url !== imageToRemove)
      }))
    } else {
      // Image existante de la BDD - ajouter à la liste de suppression
      setImagesToDelete(prev => [...prev, imageToRemove])
    }

    // Supprimer du groupe
    setImageGroups(prev => {
      if (groupId === 'ungrouped') {
        const currentImages = Array.isArray(prev[groupId]) ? prev[groupId] : []
        return {
          ...prev,
          ungrouped: currentImages.filter((_, i) => i !== imageIndex)
        }
      } else {
        const currentGroup = prev[groupId]
        if (currentGroup && !Array.isArray(currentGroup)) {
          return {
            ...prev,
            [groupId]: {
              ...currentGroup,
              images: currentGroup.images.filter((_, i) => i !== imageIndex)
            }
          }
        }
        return prev
      }
    })
  }

  // Repositionner une image dans un groupe
  const handleImageReposition = (groupId: string, imageIndex: number) => {
    const group = imageGroups[groupId]
    const images = groupId === 'ungrouped' 
      ? (Array.isArray(group) ? group : [])
      : ((group && !Array.isArray(group)) ? group.images : [])
    
    const imageUrl = images[imageIndex]
    return { groupId, imageIndex, imageUrl }
  }

  // Télécharger les nouvelles images
  const uploadNewImages = async () => {
    const uploadedUrls: Record<string, string[]> = {}

    for (const [groupId, files] of Object.entries(tempImageFiles)) {
      if (files.length === 0) continue

      const groupUploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${groupId}_${i}.${fileExt}`
        const filePath = fileName

        const { error: uploadError } = await supabase.storage
          .from('models')
          .upload(filePath, file)

        if (uploadError) {
          throw new Error(`Erreur lors du téléchargement de l'image: ${uploadError.message}`)
        }

        const { data: imageData } = supabase.storage.from('models').getPublicUrl(filePath)
        groupUploadedUrls.push(imageData.publicUrl)
      }

      uploadedUrls[groupId] = groupUploadedUrls
    }

    return uploadedUrls
  }

  // Convertir les groupes pour la sauvegarde
  const getGroupsForSave = (uploadedUrls: Record<string, string[]>) => {
    const finalGroups: ImageGroups = {}

    for (const [groupId, group] of Object.entries(imageGroups)) {
      const tempUrls = tempImageUrls[groupId] || []
      const newUrls = uploadedUrls[groupId] || []
      
      if (groupId === 'ungrouped') {
        const currentImages = Array.isArray(group) ? group : []
        // Remplacer les URLs temporaires par les URLs finales
        let finalImages = [...currentImages]
        tempUrls.forEach((tempUrl, index) => {
          const tempIndex = finalImages.indexOf(tempUrl)
          if (tempIndex !== -1 && newUrls[index]) {
            finalImages[tempIndex] = newUrls[index]
          }
        })
        // Filtrer les images supprimées
        finalImages = finalImages.filter(img => !imagesToDelete.includes(img))
        
        if (finalImages.length > 0) {
          finalGroups.ungrouped = finalImages
        }
      } else if (group && !Array.isArray(group)) {
        // Remplacer les URLs temporaires par les URLs finales
        let finalImages = [...group.images]
        tempUrls.forEach((tempUrl, index) => {
          const tempIndex = finalImages.indexOf(tempUrl)
          if (tempIndex !== -1 && newUrls[index]) {
            finalImages[tempIndex] = newUrls[index]
          }
        })
        // Filtrer les images supprimées
        finalImages = finalImages.filter(img => !imagesToDelete.includes(img))
        
        // Toujours conserver le groupe s'il a un nom, même s'il est vide temporairement
        finalGroups[groupId] = {
          name: group.name,
          images: finalImages
        }
      }
    }

    return finalGroups
  }

  // Nettoyer les images et réinitialiser les états
  const cleanupAndReset = () => {
    // Nettoyer toutes les URLs blob temporaires
    Object.values(tempImageUrls).forEach(urls => cleanupBlobUrls(urls))
    
    // Réinitialiser les états
    setTempImageFiles({})
    setTempImageUrls({})
    setImagesToDelete([])
  }

  // Réinitialiser les groupes
  const resetImageGroups = () => {
    cleanupAndReset()
    
    // Réinitialiser avec les groupes originaux
    if (initialImageGroups) {
      setImageGroups(initialImageGroups)
    } else if (additionalImages.length > 0) {
      setImageGroups({ ungrouped: additionalImages })
    } else {
      setImageGroups({ ungrouped: [] })
    }
  }

  return {
    imageGroups,
    setImageGroups,
    imagesToDelete,
    handleImageAdd,
    handleImageRemove,
    handleImageReposition,
    uploadNewImages,
    getGroupsForSave,
    cleanupAndReset,
    resetImageGroups,
  }
} 