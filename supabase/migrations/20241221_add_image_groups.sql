-- Migration pour ajouter le système de groupes d'images à la table models
-- Date: 2024-12-21
-- Description: Ajoute la colonne image_groups pour organiser les images supplémentaires en groupes nommés

-- Ajouter la colonne pour les groupes d'images
ALTER TABLE public.models 
ADD COLUMN IF NOT EXISTS image_groups JSONB;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.models.image_groups IS 'Groupes d''images avec structure: {"ungrouped": ["url1"], "group_id": {"name": "Nom du groupe", "images": ["url2", "url3"]}}';

-- Fonction pour migrer les images existantes vers le nouveau système
-- Cette fonction va déplacer toutes les images existantes dans additional_images 
-- vers le groupe "ungrouped" dans image_groups
DO $$
DECLARE
    model_record RECORD;
BEGIN
    -- Pour chaque modèle ayant des images supplémentaires
    FOR model_record IN 
        SELECT id, additional_images 
        FROM public.models 
        WHERE additional_images IS NOT NULL AND array_length(additional_images, 1) > 0
    LOOP
        -- Créer la structure image_groups avec les images existantes dans "ungrouped"
        UPDATE public.models 
        SET image_groups = jsonb_build_object('ungrouped', to_jsonb(model_record.additional_images))
        WHERE id = model_record.id;
    END LOOP;
END $$; 