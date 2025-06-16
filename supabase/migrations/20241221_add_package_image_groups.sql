-- Migration pour ajouter le support des groupes d'images dans les packages
-- Date: 2024-12-21
-- Description: Ajoute la colonne shared_image_groups pour permettre aux agents de sélectionner quels groupes d'images partager avec les clients

-- Ajouter la colonne pour les groupes d'images partagés
ALTER TABLE public.package_models 
ADD COLUMN IF NOT EXISTS shared_image_groups JSONB;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.package_models.shared_image_groups IS 'Groupes d''images sélectionnés pour le partage: ["ungrouped", "group_id1", "group_id2"]';

-- Ajouter une contrainte pour s'assurer que c'est un tableau JSON
ALTER TABLE public.package_models 
ADD CONSTRAINT check_shared_image_groups 
CHECK (
  shared_image_groups IS NULL OR 
  jsonb_typeof(shared_image_groups) = 'array'
); 