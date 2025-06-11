-- Ajouter une colonne pour marquer les notifications comme vues
ALTER TABLE public.appointments 
ADD COLUMN notification_viewed_at timestamp with time zone NULL;

-- Créer un index pour optimiser les requêtes de notifications non vues
CREATE INDEX IF NOT EXISTS idx_appointments_notification_viewed 
ON public.appointments (notification_viewed_at) 
WHERE notification_viewed_at IS NULL;

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