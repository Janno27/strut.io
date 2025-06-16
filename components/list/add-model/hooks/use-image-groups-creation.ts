"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ImageGroups, ImageGroup, FocalPoint } from "../../detail/types"

export function useImageGroupsCreation() {
  // État des groupes d'images
  const [imageGroups, setImageGroups] = useState<ImageGroups>({ ungrouped: [] })

  // États pour les nouvelles images temporaires
  const [tempImageFiles, setTempImageFiles] = useState<Record<string, File[]>>({})
  const [tempImageUrls, setTempImageUrls] = useState<Record<string, string[]>>({})
  const [additionalImagesFocalPoints, setAdditionalImagesFocalPoints] = useState<Record<string, FocalPoint>>({})

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
  const handleImageAdd = (groupId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Créer les URLs temporaires
    const newImageUrls = files.map(file => URL.createObjectURL(file))

    // Ajouter les fichiers temporaires
    setTempImageFiles(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), ...files]
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

    // Réinitialiser l'input
    e.target.value = ""
  }

  // Supprimer une image d'un groupe
  const handleImageRemove = (groupId: string, imageIndex: number) => {
    const group = imageGroups[groupId]
    const images = groupId === 'ungrouped' 
      ? (Array.isArray(group) ? group : [])
      : ((group && !Array.isArray(group)) ? group.images : [])
    
    const imageToRemove = images[imageIndex]
    if (!imageToRemove) return

    // Nettoyer l'URL blob
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

  // Gérer la réorganisation des images dans un groupe
  const handleImagesReorder = (groupId: string, newImages: string[]) => {
    setImageGroups(prev => {
      if (groupId === 'ungrouped') {
        return {
          ...prev,
          ungrouped: newImages
        }
      } else {
        const currentGroup = prev[groupId]
        if (currentGroup && !Array.isArray(currentGroup)) {
          return {
            ...prev,
            [groupId]: {
              ...currentGroup,
              images: newImages
            }
          }
        }
        return prev
      }
    })
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
        
        // Toujours conserver le groupe s'il a un nom
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
    setImageGroups({ ungrouped: [] })
    setAdditionalImagesFocalPoints({})
  }

  // Gérer les focal points
  const handleFocalPointUpdate = (imageUrl: string, focalPoint: FocalPoint) => {
    setAdditionalImagesFocalPoints(prev => ({
      ...prev,
      [imageUrl]: focalPoint
    }))
  }

  return {
    imageGroups,
    setImageGroups,
    additionalImagesFocalPoints,
    handleImageAdd,
    handleImageRemove,
    handleImageReposition,
    handleImagesReorder,
    handleFocalPointUpdate,
    uploadNewImages,
    getGroupsForSave,
    cleanupAndReset,
  }
} 