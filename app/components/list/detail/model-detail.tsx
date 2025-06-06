"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/app/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { ModelDetailProps, ModelFormData } from "./types"
import { ActionButtons } from "./action-buttons"
import { DeleteConfirmation } from "./delete-confirmation"
import { ModelInfo } from "./model-info"
import { ModelEditForm } from "./model-edit-form"
import { ImageGallery } from "./image-gallery"
import { ImageModal } from "./image-modal"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Upload, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ModelDetail({ 
  model, 
  onClose, 
  isFavorite = false, 
  onToggleFavorite,
  canEdit = false,
  onModelUpdated,
  onModelDeleted
}: ModelDetailProps) {
  // États locaux
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ModelFormData>({
    firstName: "",
    lastName: "",
    age: "",
    height: "",
    bust: "",
    waist: "",
    hips: "",
    shoeSize: "",
    eyeColor: "",
    hairColor: "",
    instagram: "",
    modelsComLink: "",
    description: ""
  })
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  const [tempMainImage, setTempMainImage] = useState<string | null>(null)
  const [tempAdditionalImages, setTempAdditionalImages] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  
  const supabase = createClient()
  const { toast } = useToast()
  
  // Extraction du prénom et nom
  const [firstName, lastName] = model.name?.split(' ') || ["", ""]
  
  // Initialisation du formulaire
  useEffect(() => {
    if (model) {
      setFormData({
        firstName: model.first_name || firstName,
        lastName: model.last_name || lastName,
        age: model.age?.toString() || "",
        height: model.height?.toString() || "",
        bust: model.bust?.toString() || "",
        waist: model.waist?.toString() || "",
        hips: model.hips?.toString() || "",
        shoeSize: model.shoe_size?.toString() || "",
        eyeColor: model.eye_color || "",
        hairColor: model.hair_color || "",
        instagram: model.instagram || "",
        modelsComLink: model.models_com_link || "",
        description: model.description || ""
      })
      
      // Initialiser les images temporaires
      setTempMainImage(null)
      setTempAdditionalImages([])
      setImagesToDelete([])
    }
  }, [model, firstName, lastName])

  // Handlers
  const handleFavoriteClick = (e: React.MouseEvent) => {
    if (onToggleFavorite) {
      onToggleFavorite(e, model.id);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleEditClick = () => {
    setIsEditing(true)
  }
  
  const handleCancelEdit = () => {
    setIsEditing(false)
    // Réinitialiser le formulaire et les images
    setFormData({
      firstName: model.first_name || firstName,
      lastName: model.last_name || lastName,
      age: model.age?.toString() || "",
      height: model.height?.toString() || "",
      bust: model.bust?.toString() || "",
      waist: model.waist?.toString() || "",
      hips: model.hips?.toString() || "",
      shoeSize: model.shoe_size?.toString() || "",
      eyeColor: model.eye_color || "",
      hairColor: model.hair_color || "",
      instagram: model.instagram || "",
      modelsComLink: model.models_com_link || "",
      description: model.description || ""
    })
    setTempMainImage(null)
    setTempAdditionalImages([])
    setMainImageFile(null)
    setAdditionalImageFiles([])
    setImagesToDelete([])
  }
  
  // Télécharger les nouvelles images
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
    
    return { newMainImageUrl, newAdditionalImageUrls };
  };
  
  const handleSaveEdit = async () => {
    try {
      setIsLoading(true)
      
      // Télécharger les nouvelles images
      const { newMainImageUrl, newAdditionalImageUrls } = await uploadNewImages();
      
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        age: parseInt(formData.age) || null,
        height: parseInt(formData.height) || null,
        bust: parseInt(formData.bust) || null,
        waist: parseInt(formData.waist) || null,
        hips: parseInt(formData.hips) || null,
        shoe_size: parseFloat(formData.shoeSize) || null,
        eye_color: formData.eyeColor || null,
        hair_color: formData.hairColor || null,
        instagram: formData.instagram || null,
        models_com_link: formData.modelsComLink || null,
        description: formData.description || null,
        main_image: newMainImageUrl,
        additional_images: newAdditionalImageUrls
      }
      
      const { error } = await supabase
        .from('models')
        .update(updateData)
        .eq('id', model.id)
      
      if (error) {
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
      }
      
      toast({
        title: "Succès",
        description: "Le modèle a été mis à jour avec succès"
      })
      
      setIsEditing(false)
      setTempMainImage(null)
      setTempAdditionalImages([])
      setMainImageFile(null)
      setAdditionalImageFiles([])
      setImagesToDelete([])
      
      if (onModelUpdated) {
        onModelUpdated()
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDeleteClick = () => {
    setIsDeleting(true)
  }
  
  const handleCancelDelete = () => {
    setIsDeleting(false)
  }
  
  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true)
      
      // Récupérer les détails du modèle
      const { data: modelData, error: fetchError } = await supabase
        .from('models')
        .select('*')
        .eq('id', model.id)
        .single()
      
      if (fetchError) {
        throw new Error(`Erreur lors de la récupération des détails: ${fetchError.message}`)
      }
      
      // Supprimer les images du bucket Storage
      if (modelData.main_image) {
        const mainImagePath = modelData.main_image.split('/').pop()
        const { error: mainImageError } = await supabase.storage
          .from('models')
          .remove([mainImagePath])
        
        if (mainImageError) {
          console.error("Erreur lors de la suppression de l'image principale:", mainImageError)
        }
      }
      
      if (modelData.additional_images && modelData.additional_images.length > 0) {
        const additionalImagePaths = modelData.additional_images.map(
          (url: string) => url.split('/').pop()
        )
        
        for (const path of additionalImagePaths) {
          const { error: additionalImageError } = await supabase.storage
            .from('models')
            .remove([path])
          
          if (additionalImageError) {
            console.error(`Erreur lors de la suppression de l'image ${path}:`, additionalImageError)
          }
        }
      }
      
      // Supprimer l'entrée dans la table models
      const { error: deleteError } = await supabase
        .from('models')
        .delete()
        .eq('id', model.id)
      
      if (deleteError) {
        throw new Error(`Erreur lors de la suppression: ${deleteError.message}`)
      }
      
      toast({
        title: "Suppression réussie",
        description: "Le modèle a été supprimé avec succès"
      })
      
      onClose()
      
      if (onModelDeleted) {
        onModelDeleted()
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setIsDeleting(false)
    }
  }

  // Gestion des images
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
    const additionalImages = model.additionalImages || []
    if (selectedImageIndex < additionalImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
      setSelectedImage(additionalImages[selectedImageIndex + 1])
    }
  }
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    const additionalImages = model.additionalImages || []
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
      setSelectedImage(additionalImages[selectedImageIndex - 1])
    }
  }
  
  // Gestion des images en mode édition
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainImageFile(file)
      const imageUrl = URL.createObjectURL(file)
      setTempMainImage(imageUrl)
    }
  }
  
  const handleAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAdditionalImageFiles(prev => [...prev, file])
      const imageUrl = URL.createObjectURL(file)
      setTempAdditionalImages(prev => [...prev, imageUrl])
    }
  }
  
  const handleRemoveAdditionalImage = (imageUrl: string, index: number) => {
    // Si c'est une image temporaire
    if (tempAdditionalImages.includes(imageUrl)) {
      const tempIndex = tempAdditionalImages.indexOf(imageUrl)
      setTempAdditionalImages(prev => prev.filter((_, i) => i !== tempIndex))
      setAdditionalImageFiles(prev => prev.filter((_, i) => i !== tempIndex))
    } 
    // Si c'est une image existante
    else if (model.additionalImages && model.additionalImages.includes(imageUrl)) {
      setImagesToDelete(prev => [...prev, imageUrl])
    }
  }

  // Séparer les images additionnelles pour l'affichage
  const additionalImages = model.additionalImages || []
  // Filtrer les images qui sont marquées pour suppression
  const displayAdditionalImages = additionalImages.filter(img => !imagesToDelete.includes(img))

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
          {isEditing ? (
            <div className="relative aspect-square">
              {tempMainImage ? (
                <>
                  <Image
                    src={tempMainImage}
                    alt="Nouvelle image principale"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => {
                      setTempMainImage(null)
                      setMainImageFile(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Image
                    src={model.imageUrl}
                    alt={model.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <label className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-10 w-10 text-white mb-2" />
                      <span className="text-white font-medium">Changer l'image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleMainImageUpload}
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative aspect-square">
              <Image
                src={model.imageUrl}
                alt={model.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          )}
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {!isEditing ? (
          // Mode affichage
          displayAdditionalImages.map((imageUrl, index) => (
            <div 
              key={index} 
              className="rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleImageClick(imageUrl, index)}
            >
              <div className="relative aspect-square">
                <Image
                  src={imageUrl}
                  alt={`${model.name} - photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
            </div>
          ))
        ) : (
          // Mode édition
          <>
            {/* Images existantes */}
            {displayAdditionalImages.map((imageUrl, index) => (
              <div key={index} className="rounded-xl overflow-hidden relative">
                <div className="relative aspect-square">
                  <Image
                    src={imageUrl}
                    alt={`${model.name} - photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => handleRemoveAdditionalImage(imageUrl, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Images temporaires */}
            {tempAdditionalImages.map((imageUrl, index) => (
              <div key={`temp-${index}`} className="rounded-xl overflow-hidden relative">
                <div className="relative aspect-square">
                  <Image
                    src={imageUrl}
                    alt={`Nouvelle photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => handleRemoveAdditionalImage(imageUrl, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Bouton d'ajout */}
            <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center aspect-square cursor-pointer hover:border-primary transition-colors">
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ajouter une photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAdditionalImageUpload}
                />
              </label>
            </div>
          </>
        )}
      </div>
      
      {/* Modal d'image plein écran */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
          onClick={handleCloseImageModal}
        >
          <div className="relative w-full max-w-4xl h-full max-h-[80vh] m-4">
            <Image
              src={selectedImage}
              alt={model.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
            
            {/* Boutons de navigation */}
            {displayAdditionalImages.length > 1 && (
              <>
                <button 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-opacity disabled:opacity-30"
                  onClick={handlePrevImage}
                  disabled={selectedImageIndex <= 0}
                >
                  <ChevronLeft className="h-8 w-8 text-white" />
                </button>
                <button 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-opacity disabled:opacity-30"
                  onClick={handleNextImage}
                  disabled={selectedImageIndex >= displayAdditionalImages.length - 1}
                >
                  <ChevronRight className="h-8 w-8 text-white" />
                </button>
              </>
            )}
            
            {/* Bouton fermer */}
            <button 
              className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-opacity"
              onClick={handleCloseImageModal}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}