-- Fonction pour marquer une notification comme vue
CREATE OR REPLACE FUNCTION mark_notification_as_viewed(appointment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.appointments 
  SET notification_viewed_at = NOW(),
      updated_at = NOW()
  WHERE id = appointment_id;
END;
$$;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION mark_notification_as_viewed TO authenticated; 