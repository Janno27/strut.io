-- Corriger la fonction release_slot_if_cancelled 
-- La table appointments n'a pas de colonne 'status'
CREATE OR REPLACE FUNCTION release_slot_if_cancelled()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Cette fonction était conçue pour une table avec une colonne 'status'
  -- Votre table appointments n'a pas cette colonne
  -- Donc on retourne simplement NEW sans traitement
  RETURN NEW;
END;
$$; 