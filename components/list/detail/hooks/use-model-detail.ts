import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ModelDetailProps, ModelFormData } from "../types"

interface UseModelDetailProps {
  model: ModelDetailProps['model']
  onModelUpdated?: () => void
  onModelDeleted?: () => void
  onClose: () => void
}

export function useModelDetail({ model, onModelUpdated, onModelDeleted, onClose }: UseModelDetailProps) {
  // États de base
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // États pour les valeurs personnalisées
  const [customEyeColor, setCustomEyeColor] = useState("")
  const [customHairColor, setCustomHairColor] = useState("")
  
  // Données du formulaire
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

  const supabase = createClient()
  
  // Extraction du prénom et nom
  const [firstName, lastName] = model.name?.split(' ') || ["", ""]
  
  // Initialisation du formulaire
  useEffect(() => {
    if (model) {
      // Déterminer si les couleurs sont des valeurs personnalisées
      const eyeColorOptions = ["bleu", "vert", "marron", "noisette", "noir", "gris"]
      const hairColorOptions = ["blond", "brun", "châtain", "roux", "noir", "gris"]
      
      const isCustomEyeColor = model.eye_color && !eyeColorOptions.includes(model.eye_color)
      const isCustomHairColor = model.hair_color && !hairColorOptions.includes(model.hair_color)
      
      setFormData({
        firstName: model.first_name || firstName,
        lastName: model.last_name || lastName,
        age: model.age?.toString() || "",
        height: model.height?.toString() || "",
        bust: model.bust?.toString() || "",
        waist: model.waist?.toString() || "",
        hips: model.hips?.toString() || "",
        shoeSize: model.shoe_size?.toString() || "",
        eyeColor: isCustomEyeColor ? "autre" : (model.eye_color || ""),
        hairColor: isCustomHairColor ? "autre" : (model.hair_color || ""),
        instagram: model.instagram || "",
        modelsComLink: model.models_com_link || "",
        description: model.description || ""
      })
      
      // Initialiser les valeurs personnalisées
      setCustomEyeColor(isCustomEyeColor ? model.eye_color || "" : "")
      setCustomHairColor(isCustomHairColor ? model.hair_color || "" : "")
    }
  }, [model, firstName, lastName])

  // Handlers pour le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Réinitialiser les valeurs personnalisées si on ne sélectionne plus "autre"
    if (name === "eyeColor" && value !== "autre") {
      setCustomEyeColor("")
    }
    if (name === "hairColor" && value !== "autre") {
      setCustomHairColor("")
    }
  }
  
  const handleCustomEyeColorChange = (value: string) => {
    setCustomEyeColor(value)
  }
  
  const handleCustomHairColorChange = (value: string) => {
    setCustomHairColor(value)
  }

  // Gestion de l'édition
  const handleEditClick = () => {
    setIsEditing(true)
  }
  
  const resetFormData = () => {
    // Déterminer si les couleurs sont des valeurs personnalisées
    const eyeColorOptions = ["bleu", "vert", "marron", "noisette", "noir", "gris"]
    const hairColorOptions = ["blond", "brun", "châtain", "roux", "noir", "gris"]
    
    const isCustomEyeColor = model.eye_color && !eyeColorOptions.includes(model.eye_color)
    const isCustomHairColor = model.hair_color && !hairColorOptions.includes(model.hair_color)
    
    setFormData({
      firstName: model.first_name || firstName,
      lastName: model.last_name || lastName,
      age: model.age?.toString() || "",
      height: model.height?.toString() || "",
      bust: model.bust?.toString() || "",
      waist: model.waist?.toString() || "",
      hips: model.hips?.toString() || "",
      shoeSize: model.shoe_size?.toString() || "",
      eyeColor: isCustomEyeColor ? "autre" : (model.eye_color || ""),
      hairColor: isCustomHairColor ? "autre" : (model.hair_color || ""),
      instagram: model.instagram || "",
      modelsComLink: model.models_com_link || "",
      description: model.description || ""
    })
    
    // Réinitialiser les valeurs personnalisées
    setCustomEyeColor(isCustomEyeColor ? model.eye_color || "" : "")
    setCustomHairColor(isCustomHairColor ? model.hair_color || "" : "")
  }

  // Gestion de la suppression
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
      
      toast.success("Le modèle a été supprimé avec succès");
      
      onClose()
      
      if (onModelDeleted) {
        onModelDeleted()
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de la suppression");
    } finally {
      setIsLoading(false)
      setIsDeleting(false)
    }
  }

  return {
    // États
    isEditing,
    isDeleting,
    isLoading,
    formData,
    firstName,
    lastName,
    customEyeColor,
    customHairColor,
    
    // Setters
    setIsEditing,
    setIsLoading,
    
    // Actions
    handleEditClick,
    handleChange,
    handleSelectChange,
    handleCustomEyeColorChange,
    handleCustomHairColorChange,
    handleDeleteClick,
    handleCancelDelete,
    handleConfirmDelete,
    resetFormData,
  }
} 