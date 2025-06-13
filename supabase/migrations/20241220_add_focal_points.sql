-- Migration pour ajouter les colonnes focal points à la table models
-- Date: 2024-12-20
-- Description: Ajoute les colonnes main_image_focal_point et additional_images_focal_points pour le repositionnement des images

-- Ajouter la colonne pour le focal point de l'image principale
ALTER TABLE public.models 
ADD COLUMN IF NOT EXISTS main_image_focal_point JSONB;

-- Ajouter la colonne pour les focal points des images supplémentaires
ALTER TABLE public.models 
ADD COLUMN IF NOT EXISTS additional_images_focal_points JSONB;

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN public.models.main_image_focal_point IS 'Point focal pour l''image principale {x: number, y: number} en pourcentages (0-100)';
COMMENT ON COLUMN public.models.additional_images_focal_points IS 'Points focaux pour les images supplémentaires, indexés par URL d''image';

-- Optionnel: Ajouter des contraintes de validation pour s'assurer que les données sont bien formatées
ALTER TABLE public.models 
ADD CONSTRAINT check_main_image_focal_point 
CHECK (
  main_image_focal_point IS NULL OR (
    main_image_focal_point ? 'x' AND 
    main_image_focal_point ? 'y' AND
    (main_image_focal_point->>'x')::numeric BETWEEN 0 AND 100 AND
    (main_image_focal_point->>'y')::numeric BETWEEN 0 AND 100
  )
);

-- Note: Pour additional_images_focal_points, la validation est plus complexe car c'est un objet
-- avec des clés dynamiques (URLs), donc on ne met pas de contrainte stricte pour le moment 