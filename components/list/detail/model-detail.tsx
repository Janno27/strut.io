"use client"

import { ModelDetailProps } from "./types"
import { ActionButtons } from "./action-buttons"
import { DeleteConfirmation } from "./delete-confirmation"
import { ModelInfo } from "./model-info"
import { ModelEditForm } from "./model-edit-form"
import { ImagePositionEditor } from "./components/image-position-editor"

// Hooks personnalisés
import { useModelDetail } from "./hooks/use-model-detail"
import { useImageManagement } from "./hooks/use-image-management"
import { useModelBooksManagement } from "./hooks/use-model-books-management"
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
    customEyeColor,
    customHairColor,
    setIsEditing,
    setIsLoading,
    handleEditClick,
    handleChange,
    handleSelectChange,
    handleCustomEyeColorChange,
    handleCustomHairColorChange,
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
    isPositionEditorOpen,
    positionImageUrl,
    positionImageType,
    mainImageFocalPoint,
    additionalImagesFocalPoints,
    getAllAdditionalImages,
    resetImages,
    uploadNewImages,
    saveImagesAndCleanup,
    handleMainImageUpload,
    handleMainImageRemove,
    handleMainImageReposition,
    handleAdditionalImageAdd,
    handleAdditionalImageRemoveByIndex,
    handleAdditionalImagesReorder,
    handleAdditionalImageReposition,
    handlePositionComplete,
    setIsPositionEditorOpen,
    handleImageClick,
    handleCloseImageModal,
    handleNextImage,
    handlePrevImage,
    // Nouvelles propriétés pour les groupes d'images
    imageGroups,
    setImageGroups,
    handleGroupImageAdd,
    handleGroupImageRemove,
    handleGroupImageReposition,
    uploadGroupImages,
    getGroupsForSave,
  } = useImageManagement({ model, isEditing, onModelUpdated })

  // Hook pour la gestion des books
  const {
    books,
    addBook,
    removeBook,
    updateBook,
    resetBooks,
    getBooksForSave,
  } = useModelBooksManagement({ model, isEditing })

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
    resetBooks()
    resetFormData()
    setIsEditing(false)
  }

  // Sauvegarder l'édition
  const handleSaveEdit = async () => {
    const success = await saveModel(
      formData, 
      uploadNewImages, 
      saveImagesAndCleanup,
      mainImageFocalPoint,
      additionalImagesFocalPoints,
      customEyeColor,
      customHairColor,
      // Nouvelles fonctions pour les groupes
      uploadGroupImages,
      getGroupsForSave,
      // Fonction pour les books
      getBooksForSave
    )
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
        {isEditing ? (
          /* Mode édition: Groupes d'images à gauche */
          <>
            <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2">
              <ModelAdditionalImages
                model={{ 
                  ...model, 
                  additional_images_focal_points: additionalImagesFocalPoints,
                  image_groups: imageGroups
                }}
                isEditing={isEditing}
                imagesToDelete={imagesToDelete}
                getAllAdditionalImages={getAllAdditionalImages}
                onImageClick={handleImageClick}
                onImagesReorder={handleAdditionalImagesReorder}
                onImageAdd={handleAdditionalImageAdd}
                onImageRemove={handleAdditionalImageRemoveByIndex}
                onImageReposition={handleAdditionalImageReposition}
                onImageGroupsChange={setImageGroups}
                onGroupImageAdd={handleGroupImageAdd}
                onGroupImageRemove={handleGroupImageRemove}
                onGroupImageReposition={handleGroupImageReposition}
              />
            </div>
            
            {/* Informations du modèle */}
            <div className="sticky top-0 self-start">
              <div className="h-full flex flex-col justify-between">
                <ModelEditForm
                  formData={formData}
                  isLoading={isLoading}
                  onChange={handleChange}
                  onSelectChange={handleSelectChange}
                  customEyeColor={customEyeColor}
                  customHairColor={customHairColor}
                  onCustomEyeColorChange={handleCustomEyeColorChange}
                  onCustomHairColorChange={handleCustomHairColorChange}
                  showImageManagement={false}
                  books={books}
                  onAddBook={addBook}
                  onRemoveBook={removeBook}
                  onUpdateBook={updateBook}
                />
              </div>
            </div>
          </>
        ) : (
          /* Mode affichage: Image principale à gauche */
          <>
            <div className="rounded-xl overflow-hidden relative">
              <ModelMainImage
                name={model.name}
                isEditing={isEditing}
                imageGroups={imageGroups}
                additionalImages={model.additionalImages}
                imageUrl={model.imageUrl}
                focalPoint={mainImageFocalPoint}
                onImageReposition={handleMainImageReposition}
              />
            </div>
            
            {/* Informations du modèle */}
            <div>
              <div className="h-full flex flex-col justify-between">
                <ModelInfo
                  model={model}
                  firstName={firstName}
                  lastName={lastName}
                />
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Images additionnelles - Seulement en mode affichage */}
      {!isEditing && (
        <div className="space-y-6">
          <ModelAdditionalImages
            model={{ 
              ...model, 
              additional_images_focal_points: additionalImagesFocalPoints,
              image_groups: imageGroups
            }}
            isEditing={isEditing}
            imagesToDelete={imagesToDelete}
            getAllAdditionalImages={getAllAdditionalImages}
            onImageClick={handleImageClick}
            onImagesReorder={handleAdditionalImagesReorder}
            onImageAdd={handleAdditionalImageAdd}
            onImageRemove={handleAdditionalImageRemoveByIndex}
            onImageReposition={handleAdditionalImageReposition}
            onImageGroupsChange={setImageGroups}
            onGroupImageAdd={handleGroupImageAdd}
            onGroupImageRemove={handleGroupImageRemove}
            onGroupImageReposition={handleGroupImageReposition}
          />
        </div>
      )}
      
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
        getAllImages={getAllAdditionalImages}
      />
      
      {/* Éditeur de position d'image */}
      <ImagePositionEditor
        isOpen={isPositionEditorOpen}
        onClose={() => setIsPositionEditorOpen(false)}
        imageUrl={positionImageUrl}
        currentFocalPoint={
          positionImageType === "main" 
            ? mainImageFocalPoint 
            : additionalImagesFocalPoints[positionImageUrl]
        }
        onPositionComplete={handlePositionComplete}
        title="Repositionner l'image"
      />
    </div>
  )
}