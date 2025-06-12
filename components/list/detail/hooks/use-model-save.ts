import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ModelFormData } from "../types"

interface UseModelSaveProps {
  modelId: string
  onModelUpdated?: () => void
  setIsLoading: (loading: boolean) => void
}

export function useModelSave({ modelId, onModelUpdated, setIsLoading }: UseModelSaveProps) {
  const supabase = createClient()

  const saveModel = async (
    formData: ModelFormData,
    uploadNewImages: () => Promise<{ newMainImageUrl: string; newAdditionalImageUrls: string[] }>,
    saveImagesAndCleanup: () => void
  ) => {
    try {
      // Validation de l'ID du modèle
      if (!modelId || modelId === 'undefined' || modelId === 'null') {
        throw new Error(`ID du modèle invalide: ${modelId}`)
      }

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
        .eq('id', modelId)
      
      if (error) {
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
      }
      
      toast.success("Le modèle a été mis à jour avec succès");
      
      // Nettoyer et réinitialiser
      saveImagesAndCleanup()
      
      if (onModelUpdated) {
        onModelUpdated()
      }

      return true
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de la mise à jour");
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    saveModel
  }
} 