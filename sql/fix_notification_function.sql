-- Solution 1: Fonction qui évite de déclencher le trigger
CREATE OR REPLACE FUNCTION mark_notification_as_viewed(appointment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update seulement notification_viewed_at sans toucher updated_at
  -- pour éviter de déclencher le trigger on_appointment_status_changed
  UPDATE public.appointments 
  SET notification_viewed_at = NOW()
  WHERE id = appointment_id;
END;
$$;

-- Alternative: Si vous voulez garder updated_at mais éviter le trigger status
-- Vous pouvez temporairement désactiver le trigger pendant l'update
CREATE OR REPLACE FUNCTION mark_notification_as_viewed_safe(appointment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Temporairement désactiver le trigger problématique
  ALTER TABLE appointments DISABLE TRIGGER on_appointment_status_changed;
  
  -- Faire l'update
  UPDATE public.appointments 
  SET notification_viewed_at = NOW(),
      updated_at = NOW()
  WHERE id = appointment_id;
  
  -- Réactiver le trigger
  ALTER TABLE appointments ENABLE TRIGGER on_appointment_status_changed;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION mark_notification_as_viewed TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_as_viewed_safe TO authenticated; 