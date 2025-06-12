"use client"

import { ModelDetailProps } from "./types"
import { ActionButtons } from "./action-buttons"
import { DeleteConfirmation } from "./delete-confirmation"
import { ModelInfo } from "./model-info"
import { ModelEditForm } from "./model-edit-form"
import { ImageCropper } from "@/components/ui/image-cropper"

// Hooks personnalisés
import { useModelDetail } from "./hooks/use-model-detail"
import { useImageManagement } from "./hooks/use-image-management"
import { useModelSave } from "./hooks/use-model-save"

// Nouveaux composants
import { ModelMainImage } from "./components/model-main-image"
import { ModelAdditionalImages } from "./components/model-additional-images"
import { ModelImageModal } from "./components/model-image-modal"

export function ModelDetail({ 
  model, 
  onClose, 
  isFavorite = false, 
  onToggleFavorite,
  canEdit = false,
  onModelUpdated,
  onModelDeleted
}: ModelDetailProps) {

  // Hook principal pour la gestion du modèle
  const {
    isEditing,
    isDeleting,
    isLoading,
    formData,
    firstName,
    lastName,
    setIsEditing,
    setIsLoading,
    handleEditClick,
    handleChange,
    handleSelectChange,
    handleDeleteClick,
    handleCancelDelete,
    handleConfirmDelete,
    resetFormData,
  } = useModelDetail({ model, onModelUpdated, onModelDeleted, onClose })

  // Hook pour la gestion des images
  const {
    tempMainImage,
    selectedImage,
    selectedImageIndex,
    imagesToDelete,
    isCropperOpen,
    cropImageUrl,
    getAllAdditionalImages,
    resetImages,
    uploadNewImages,
    saveImagesAndCleanup,
    handleMainImageUpload,
    handleMainImageRemove,
    handleMainImageCrop,
    handleAdditionalImageAdd,
    handleAdditionalImageRemoveByIndex,
    handleAdditionalImagesReorder,
    handleAdditionalImageCrop,
    handleCropComplete,
    setIsCropperOpen,
    handleImageClick,
    handleCloseImageModal,
    handleNextImage,
    handlePrevImage,
  } = useImageManagement({ model, isEditing, onModelUpdated })

  // Hook pour la sauvegarde
  const { saveModel } = useModelSave({ 
    modelId: model.id, 
    onModelUpdated, 
    setIsLoading 
  })

  // Gestion des favoris
  const handleFavoriteClick = (e: React.MouseEvent) => {
    if (onToggleFavorite) {
      onToggleFavorite(e, model.id);
    }
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    resetImages()
    resetFormData()
    setIsEditing(false)
  }

  // Sauvegarder l'édition
  const handleSaveEdit = async () => {
    const success = await saveModel(formData, uploadNewImages, saveImagesAndCleanup)
    if (success) {
      setIsEditing(false)
    }
  }

  return (
    <div className="w-full">
      <ActionButtons
        isFavorite={isFavorite}
        canEdit={canEdit}
        isEditing={isEditing}
        isDeleting={isDeleting}
        isLoading={isLoading}
        onToggleFavorite={onToggleFavorite ? handleFavoriteClick : undefined}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        onClose={onClose}
      />
      
      <DeleteConfirmation
        isVisible={isDeleting}
        isLoading={isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-2 mb-6">
        {/* Image principale */}
        <div className="rounded-xl overflow-hidden relative">
          <ModelMainImage
            imageUrl={model.imageUrl}
            name={model.name}
            isEditing={isEditing}
            tempMainImage={tempMainImage}
            onImageUpload={handleMainImageUpload}
            onImageRemove={handleMainImageRemove}
            onImageCrop={handleMainImageCrop}
          />
        </div>
        
        {/* Informations du modèle */}
        <div>
          <div className="h-full flex flex-col justify-between">
            {isEditing ? (
              <ModelEditForm
                formData={formData}
                isLoading={isLoading}
                onChange={handleChange}
                onSelectChange={handleSelectChange}
                showImageManagement={false}
              />
            ) : (
              <ModelInfo
                model={model}
                firstName={firstName}
                lastName={lastName}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Images additionnelles */}
      <div className="space-y-2">
        <ModelAdditionalImages
          model={model}
          isEditing={isEditing}
          imagesToDelete={imagesToDelete}
          getAllAdditionalImages={getAllAdditionalImages}
          onImageClick={handleImageClick}
          onImagesReorder={handleAdditionalImagesReorder}
          onImageAdd={handleAdditionalImageAdd}
          onImageRemove={handleAdditionalImageRemoveByIndex}
          onImageCrop={handleAdditionalImageCrop}
        />
      </div>
      
      {/* Modal d'image plein écran */}
      <ModelImageModal
        selectedImage={selectedImage}
        selectedImageIndex={selectedImageIndex}
        modelName={model.name}
        additionalImages={model.additionalImages || []}
        imagesToDelete={imagesToDelete}
        onClose={handleCloseImageModal}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      />
      
      {/* Composant de recadrage */}
      <ImageCropper
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageUrl={cropImageUrl}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        title="Recadrer l'image"
      />
    </div>
  )
}