-- Migration pour ajouter la colonne shared_books à la table package_models
-- Date: 2024-12-22
-- Description: Ajoute la colonne shared_books pour permettre la sélection des books à partager par package

-- Ajouter la colonne pour les books partagés
ALTER TABLE public.package_models 
ADD COLUMN IF NOT EXISTS shared_books TEXT[];

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.package_models.shared_books IS 'Liste des IDs des books/portfolios partagés pour ce modèle dans ce package';

-- Optionnel: Ajouter un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_package_models_shared_books 
ON public.package_models USING GIN (shared_books); 