-- Fonction pour récupérer les modèles d'un package avec leurs groupes d'images partagés
-- Date: 2024-12-21
-- Description: Remplace get_package_models pour inclure les informations sur les groupes d'images partagés

CREATE OR REPLACE FUNCTION get_package_models_with_groups(package_uuid UUID)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  gender TEXT,
  height INTEGER,
  bust INTEGER,
  waist INTEGER,
  hips INTEGER,
  shared_image_groups JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.first_name,
    m.last_name,
    m.gender,
    m.height,
    m.bust,
    m.waist,
    m.hips,
    COALESCE(pm.shared_image_groups, '[]'::jsonb) as shared_image_groups
  FROM models m
  INNER JOIN package_models pm ON m.id = pm.model_id
  WHERE pm.package_id = package_uuid
  ORDER BY m.first_name, m.last_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 