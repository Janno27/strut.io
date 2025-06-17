-- Migration pour mettre à jour la fonction get_package_models_with_groups
-- Date: 2024-12-22
-- Description: Met à jour la fonction pour inclure les books et shared_books

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS get_package_models_with_groups(package_uuid uuid);

-- Créer la nouvelle fonction avec support des books
CREATE OR REPLACE FUNCTION get_package_models_with_groups(package_uuid uuid)
RETURNS TABLE (
  id text,
  first_name text,
  last_name text,
  gender text,
  height integer,
  bust integer,
  waist integer,
  hips integer,
  shared_image_groups text[],
  books jsonb,
  shared_books text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id::text,
    m.first_name,
    m.last_name,
    m.gender,
    m.height,
    m.bust,
    m.waist,
    m.hips,
    pm.shared_image_groups,
    m.books,
    pm.shared_books
  FROM models m
  INNER JOIN package_models pm ON m.id::text = pm.model_id
  WHERE pm.package_id = package_uuid::text
  ORDER BY m.first_name, m.last_name;
END;
$$; 