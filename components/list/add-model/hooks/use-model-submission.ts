import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { AddModelFormData, ModelImageUploadResult, FocalPoint } from "../types"
import { ImageGroups } from "../../detail/types"
import { generateDefaultImage, generateFileName } from "../utils/model-utils"

interface UseModelSubmissionProps {
  agentId?: string
}

export function useModelSubmission({ agentId }: UseModelSubmissionProps) {
  const supabase = createClient()

  // Télécharger les images sur Supabase Storage et récupérer les URLs publiques
  const uploadImagesToStorage = async (
    mainImageFile: File | null,
    additionalImageFiles: File[],
    formData: AddModelFormData
  ): Promise<ModelImageUploadResult> => {
    try {
      // Générer une image par défaut si pas d'image principale
      let finalMainImageFile = mainImageFile;
      if (!mainImageFile) {
        const defaultImageDataUrl = await generateDefaultImage(formData);
        // Convertir dataURL en blob puis en file
        const response = await fetch(defaultImageDataUrl);
        const blob = await response.blob();
        finalMainImageFile = new File([blob], `${formData.firstName}_${formData.lastName}_default.png`, { type: 'image/png' });
      }

      if (!finalMainImageFile) {
        throw new Error("Aucune image principale n'a pu être générée");
      }

      // Télécharger l'image principale
      let mainImageUrl = "";
      const filePath = generateFileName(finalMainImageFile.name, 'main', agentId);
      

      
      // Upload avec options optimisées pour la qualité
      const uploadResult = await supabase.storage
        .from('models')
        .upload(filePath, finalMainImageFile, {
          cacheControl: '31536000', // 1 an de cache
          upsert: false, // Ne pas écraser les fichiers existants
          contentType: finalMainImageFile.type, // Préserver le type MIME original
        });
        
      if (uploadResult.error) {
        console.error("Erreur détaillée d'upload:", uploadResult.error);
        throw new Error(`Erreur lors du téléchargement de l'image principale: ${uploadResult.error.message}`);
      }

      // Récupérer l'URL publique
      const { data: mainImageData } = supabase.storage.from('models').getPublicUrl(filePath);
      if (!mainImageData) {
        throw new Error("Impossible d'obtenir l'URL publique de l'image principale");
      }
      mainImageUrl = mainImageData.publicUrl;


      // Télécharger les images supplémentaires
      const additionalImageUrls: string[] = [];
      for (let i = 0; i < additionalImageFiles.length; i++) {
        const file = additionalImageFiles[i];
        const filePath = generateFileName(file.name, 'additional', agentId, i);
        

        
        const uploadResult = await supabase.storage
          .from('models')
          .upload(filePath, file, {
            cacheControl: '31536000', // 1 an de cache
            upsert: false, // Ne pas écraser les fichiers existants
            contentType: file.type, // Préserver le type MIME original
          });

        if (uploadResult.error) {
          console.error("Erreur d'upload image supplémentaire:", uploadResult.error);
          throw new Error(`Erreur lors du téléchargement de l'image supplémentaire ${i + 1}: ${uploadResult.error.message}`);
        }

        // Récupérer l'URL publique
        const { data: additionalImageData } = supabase.storage.from('models').getPublicUrl(filePath);
        if (additionalImageData) {
          additionalImageUrls.push(additionalImageData.publicUrl);
        }
      }

      return { mainImageUrl, additionalImageUrls };
    } catch (error) {
      console.error("Erreur dans uploadImagesToStorage:", error);
      throw error;
    }
  }

  // Soumettre le modèle à la base de données
  const submitModel = async (
    formData: AddModelFormData,
    mainImageFile: File | null,
    additionalImageFiles: File[],
    mainImageFocalPoint?: FocalPoint,
    additionalImagesFocalPoints?: Record<string, FocalPoint>,
    additionalImages?: string[], // Ajouter l'ordre des images (ancien système)
    // Nouveaux paramètres pour les groupes
    uploadGroupImages?: () => Promise<Record<string, string[]>>,
    getGroupsForSave?: (uploadedUrls: Record<string, string[]>) => ImageGroups
  ): Promise<boolean> => {
    try {
      if (!agentId) {
        throw new Error("Vous devez être connecté pour ajouter un modèle");
      }

      // Télécharger les images
      const { mainImageUrl, additionalImageUrls } = await uploadImagesToStorage(
        mainImageFile, 
        additionalImageFiles, 
        formData
      );

      // Préparer les données de base du modèle
      const modelData: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        gender: formData.gender,
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
        main_image: mainImageUrl,
        main_image_focal_point: mainImageFocalPoint || null,
        agent_id: agentId
      };

      // Gérer les groupes d'images si les fonctions sont disponibles
      if (uploadGroupImages && getGroupsForSave) {
        // Nouveau système avec groupes
        const uploadedGroupUrls = await uploadGroupImages()
        const finalImageGroups = getGroupsForSave(uploadedGroupUrls)
        modelData.image_groups = finalImageGroups
        
        // Pour la rétrocompatibilité, extraire toutes les images dans additional_images
        const allAdditionalImages: string[] = []
        Object.values(finalImageGroups).forEach(group => {
          if (Array.isArray(group)) {
            allAdditionalImages.push(...group)
          } else if (group && typeof group === 'object' && 'images' in group) {
            allAdditionalImages.push(...group.images)
          }
        })
        modelData.additional_images = allAdditionalImages
        modelData.additional_images_focal_points = additionalImagesFocalPoints || null
      } else {
        // Ancien système sans groupes
        // Mapper les focal points des images supplémentaires avec les nouvelles URLs
        let mappedAdditionalImagesFocalPoints: Record<string, FocalPoint> | null = null;
        if (additionalImagesFocalPoints && additionalImages && Object.keys(additionalImagesFocalPoints).length > 0) {
          mappedAdditionalImagesFocalPoints = {};
          
          // Mapper les focal points en utilisant l'ordre des images dans additionalImages
          additionalImages.forEach((tempUrl, index) => {
            const newUrl = additionalImageUrls[index];
            const focalPoint = additionalImagesFocalPoints[tempUrl];
            
            if (focalPoint && newUrl) {
              mappedAdditionalImagesFocalPoints![newUrl] = focalPoint;
            }
          });
        }
        
        modelData.additional_images = additionalImageUrls
        modelData.additional_images_focal_points = mappedAdditionalImagesFocalPoints
      }
      

      
      // Insérer les données dans la table models
      const insertResult = await supabase
        .from('models')
        .insert([modelData]);
      
      if (insertResult.error) {
        console.error("Erreur d'insertion dans la base de données:", insertResult.error);
        throw insertResult.error;
      }
      

      toast.success("Le modèle a été ajouté avec succès");
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du modèle:", error);
      toast.error(error.message || "Une erreur est survenue lors de l'ajout du modèle");
      return false;
    }
  }

  return {
    submitModel,
    uploadImagesToStorage,
  }
} 