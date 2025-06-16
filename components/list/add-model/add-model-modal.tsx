"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ImagePositionEditor } from "@/components/list/detail/components/image-position-editor"
import { MainImageUploader } from "@/components/ui/main-image-uploader"
import { DraggableImageGrid } from "@/components/ui/draggable-image-grid"
import { useAuth } from "@/lib/auth/auth-provider"
import { useAddModelForm } from "./hooks/use-add-model-form"
import { useModelImages } from "./hooks/use-model-images"
import { useImageGroupsCreation } from "./hooks/use-image-groups-creation"
import { useModelSubmission } from "./hooks/use-model-submission"
import { ModelFormFields } from "./components/model-form-fields"
import { ModelImagesSection } from "./components/model-images-section"
import { ModelImageGroupsSection } from "./components/model-image-groups-section"
import { AddModelModalProps } from "./types"

export function AddModelModal({ isOpen, onClose, onModelAdded, appointmentData }: AddModelModalProps) {
  const { profile } = useAuth()

  // États pour le repositionnement d'image
  const [isPositionEditorOpen, setIsPositionEditorOpen] = useState(false)
  const [positionImageUrl, setPositionImageUrl] = useState("")
  const [positionImageType, setPositionImageType] = useState<"main" | "group">("main")
  const [positionGroupId, setPositionGroupId] = useState<string>("")
  const [positionImageIndex, setPositionImageIndex] = useState<number>(-1)

  // Hooks pour la gestion du formulaire
  const {
    formData,
    customEyeColor,
    customHairColor,
    isLoading,
    handleChange,
    handleSelectChange,
    handleCustomValueChange,
    validateForm,
    resetForm,
    getFinalFormData,
    setIsLoading,
  } = useAddModelForm({ appointmentData })

  // Hooks pour la gestion des images
  const {
    mainImage,
    additionalImages,
    mainImageFile,
    additionalImageFiles,
    mainImageFocalPoint,
    additionalImagesFocalPoints,
    handleMainImageUpload,
    handleMainImageRemove,
    handleAdditionalImageUpload,
    handleAdditionalImageRemove,
    handleAdditionalImagesReorder,
    handleMainImageReposition,
    handleAdditionalImageReposition,
    handlePositionComplete: handleOldPositionComplete,
    resetImages,
  } = useModelImages()

  // Hook pour les groupes d'images
  const {
    imageGroups,
    setImageGroups,
    additionalImagesFocalPoints: groupImagesFocalPoints,
    handleImageAdd: handleGroupImageAdd,
    handleImageRemove: handleGroupImageRemove,
    handleImageReposition: handleGroupImageReposition,
    handleImagesReorder: handleGroupImagesReorder,
    handleFocalPointUpdate,
    uploadNewImages: uploadGroupImages,
    getGroupsForSave,
    cleanupAndReset: cleanupGroupImages,
  } = useImageGroupsCreation()

  // Gérer le repositionnement des images de groupes
  const handleGroupImageRepositionClick = (groupId: string, imageIndex: number) => {
    const repositionData = handleGroupImageReposition(groupId, imageIndex)
    if (repositionData) {
      setPositionImageUrl(repositionData.imageUrl)
      setPositionImageType("group")
      setPositionGroupId(groupId)
      setPositionImageIndex(imageIndex)
      setIsPositionEditorOpen(true)
    }
  }

  // Gérer la completion du repositionnement
  const handlePositionComplete = (focalPoint: { x: number; y: number }) => {
    if (positionImageType === "main") {
      handleOldPositionComplete(focalPoint)
    } else if (positionImageType === "group") {
      handleFocalPointUpdate(positionImageUrl, focalPoint)
    }
    setIsPositionEditorOpen(false)
  }

  // Hook pour la soumission
  const { submitModel } = useModelSubmission({ agentId: profile?.id })

  // Gérer la fermeture du modal
  const handleClose = () => {
    resetForm()
    resetImages()
    cleanupGroupImages()
    onClose()
  }

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profile || !profile.id) {
      return
    }
    
    // Validation du formulaire
    const validation = validateForm()
    if (!validation.isValid) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const finalFormData = getFinalFormData()
      const success = await submitModel(
        finalFormData, 
        mainImageFile, 
        additionalImageFiles,
        mainImageFocalPoint,
        additionalImagesFocalPoints,
        additionalImages,
        // Nouveaux paramètres pour les groupes
        uploadGroupImages,
        getGroupsForSave
      )
      
      if (success) {
        // Réinitialiser le formulaire et fermer la modale
        resetForm()
        resetImages()
        cleanupGroupImages()
        
        // Notifier le parent que le modèle a été ajouté
        onModelAdded?.()
        handleClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau modèle</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire ci-dessous pour ajouter un nouveau modèle à votre catalogue.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Image principale */}
            <div className="space-y-2">
              <Label>Photo principale</Label>
              <MainImageUploader
                image={mainImage}
                focalPoint={mainImageFocalPoint}
                onImageUpload={handleMainImageUpload}
                onImageRemove={handleMainImageRemove}
                onImageReposition={handleMainImageReposition}
              />
            </div>
            
            {/* Champs du formulaire */}
            <div className="md:col-span-2">
              <ModelFormFields
                formData={formData}
                customEyeColor={customEyeColor}
                customHairColor={customHairColor}
                isLoading={isLoading}
                onChange={handleChange}
                onSelectChange={handleSelectChange}
                onCustomValueChange={handleCustomValueChange}
              />
            </div>
          </div>
          
          {/* Images supplémentaires avec groupes */}
          <ModelImageGroupsSection
            imageGroups={imageGroups}
            focalPoints={groupImagesFocalPoints}
            onImageGroupsChange={setImageGroups}
            onImageAdd={handleGroupImageAdd}
            onImageRemove={handleGroupImageRemove}
            onImageReposition={handleGroupImageRepositionClick}
          />
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Chargement..." : "Ajouter le modèle"}
            </Button>
          </div>
        </form>
        
        {/* Éditeur de position d'image */}
        <ImagePositionEditor
          isOpen={isPositionEditorOpen}
          onClose={() => setIsPositionEditorOpen(false)}
          imageUrl={positionImageUrl}
          currentFocalPoint={
            positionImageType === "main" 
              ? mainImageFocalPoint 
              : positionImageType === "group"
              ? groupImagesFocalPoints[positionImageUrl]
              : additionalImagesFocalPoints[positionImageUrl]
          }
          onPositionComplete={handlePositionComplete}
          title="Repositionner l'image"
        />
      </DialogContent>
    </Dialog>
  )
} 