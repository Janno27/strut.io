-- Migration pour supprimer la colonne main_image de la table models
-- Date: 2024-12-23
-- Description: L'image principale est maintenant automatiquement récupérée depuis les groupes d'images

-- Supprimer la colonne main_image et son focal point associé
ALTER TABLE public.models 
DROP COLUMN IF EXISTS main_image;

ALTER TABLE public.models 
DROP COLUMN IF EXISTS main_image_focal_point;

-- Supprimer aussi la contrainte de validation du focal point principal si elle existe
ALTER TABLE public.models 
DROP CONSTRAINT IF EXISTS check_main_image_focal_point;

-- Ajouter un commentaire pour documenter le changement
COMMENT ON TABLE public.models IS 'Table des modèles. L''image principale est automatiquement récupérée depuis la première image des groupes d''images (image_groups.ungrouped[0] ou premier groupe.images[0])';

-- Note: Les colonnes conservées :
-- - image_groups : Contient les groupes d'images organisés
-- - additional_images : Images supplémentaires (système legacy, toujours supporté pour compatibilité)
-- - additional_images_focal_points : Points focaux pour les images supplémentaires 