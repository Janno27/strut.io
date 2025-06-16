import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ModelFormData, FocalPoint, ImageGroups } from "../types"

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
    saveImagesAndCleanup: () => void,
    mainImageFocalPoint?: FocalPoint,
    additionalImagesFocalPoints?: Record<string, FocalPoint>,
    customEyeColor?: string,
    customHairColor?: string,
    // Nouveaux paramètres pour les groupes
    uploadGroupImages?: () => Promise<Record<string, string[]>>,
    getGroupsForSave?: (uploadedUrls: Record<string, string[]>) => ImageGroups
  ) => {
    try {
      // Validation de l'ID du modèle
      if (!modelId || modelId === 'undefined' || modelId === 'null') {
        throw new Error(`ID du modèle invalide: ${modelId}`)
      }

      setIsLoading(true)
      
      // Télécharger les nouvelles images (ancien système)
      const { newMainImageUrl, newAdditionalImageUrls } = await uploadNewImages();
      
      // Déterminer les couleurs finales
      const finalEyeColor = formData.eyeColor === "autre" ? customEyeColor : formData.eyeColor
      const finalHairColor = formData.hairColor === "autre" ? customHairColor : formData.hairColor
      
      // Préparer les données de base
      const updateData: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        age: parseInt(formData.age) || null,
        height: parseInt(formData.height) || null,
        bust: parseInt(formData.bust) || null,
        waist: parseInt(formData.waist) || null,
        hips: parseInt(formData.hips) || null,
        shoe_size: parseFloat(formData.shoeSize) || null,
        eye_color: finalEyeColor || null,
        hair_color: finalHairColor || null,
        instagram: formData.instagram || null,
        models_com_link: formData.modelsComLink || null,
        description: formData.description || null,
        main_image: newMainImageUrl,
        main_image_focal_point: mainImageFocalPoint || null,
        additional_images_focal_points: additionalImagesFocalPoints || null
      }

      // Gérer les groupes d'images si les fonctions sont disponibles
      if (uploadGroupImages && getGroupsForSave) {
        // Nouveau système avec groupes
        const uploadedGroupUrls = await uploadGroupImages()
        const finalImageGroups = getGroupsForSave(uploadedGroupUrls)
        updateData.image_groups = finalImageGroups
        
        // Pour la rétrocompatibilité, extraire toutes les images dans additional_images
        const allAdditionalImages: string[] = []
        Object.values(finalImageGroups).forEach(group => {
          if (Array.isArray(group)) {
            allAdditionalImages.push(...group)
          } else if (group && typeof group === 'object' && 'images' in group) {
            allAdditionalImages.push(...group.images)
          }
        })
        updateData.additional_images = allAdditionalImages
      } else {
        // Ancien système sans groupes
        updateData.additional_images = newAdditionalImageUrls
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