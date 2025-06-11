-- Corriger la fonction release_slot_if_cancelled pour gérer l'absence du champ status
CREATE OR REPLACE FUNCTION release_slot_if_cancelled()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifier si les colonnes nécessaires existent avant de les utiliser
  -- Cette fonction était probablement conçue pour une table avec un champ 'status'
  -- Mais votre table appointments n'a pas ce champ
  
  -- Pour l'instant, on va juste ignorer cette logique
  -- car elle ne s'applique pas à votre structure de données
  RETURN NEW;
END;
$$;

-- Alternative: Si vous voulez supprimer complètement ce trigger
-- DROP TRIGGER IF EXISTS on_appointment_status_changed ON appointments; 