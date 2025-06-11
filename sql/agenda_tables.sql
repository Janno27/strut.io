-- Tables pour l'agenda

-- Table pour les créneaux de disponibilité de l'agent
CREATE TABLE public.agent_slots (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  agent_id UUID NOT NULL,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT NULL,
  description TEXT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT agent_slots_pkey PRIMARY KEY (id),
  CONSTRAINT agent_slots_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT agent_slots_time_check CHECK (end_datetime > start_datetime)
) TABLESPACE pg_default;

-- Table pour les rendez-vous pris par les mannequins
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  slot_id UUID NOT NULL,
  model_name TEXT NOT NULL,
  model_email TEXT NULL,
  model_phone TEXT NULL,
  model_instagram TEXT NULL,
  notes TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.agent_slots (id) ON DELETE CASCADE,
  CONSTRAINT appointments_status_check CHECK (
    (status = ANY (ARRAY['pending'::TEXT, 'confirmed'::TEXT, 'cancelled'::TEXT, 'completed'::TEXT]))
  )
) TABLESPACE pg_default;

-- Trigger pour mettre à jour les timestamps
CREATE TRIGGER update_agent_slots_timestamp
BEFORE UPDATE ON agent_slots 
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_appointments_timestamp
BEFORE UPDATE ON appointments 
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Index pour optimiser les requêtes
CREATE INDEX idx_agent_slots_agent_id_datetime ON agent_slots (agent_id, start_datetime);
CREATE INDEX idx_appointments_slot_id ON appointments (slot_id);

-- Active RLS sur les tables
ALTER TABLE agent_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour agent_slots
CREATE POLICY "Les agents peuvent gérer leurs créneaux" ON agent_slots
  FOR ALL
  TO authenticated
  USING (agent_id = auth.uid());

-- Politique pour permettre la lecture publique des créneaux disponibles (pour les mannequins)
CREATE POLICY "Lecture publique des créneaux disponibles" ON agent_slots
  FOR SELECT
  TO anon
  USING (is_available = true AND start_datetime > now());

-- Politiques RLS pour appointments
CREATE POLICY "Les agents peuvent voir les rendez-vous de leurs créneaux" ON appointments
  FOR ALL
  TO authenticated
  USING (
    slot_id IN (
      SELECT id FROM agent_slots WHERE agent_id = auth.uid()
    )
  );

-- Politique pour permettre l'insertion publique de rendez-vous (pour les mannequins)
CREATE POLICY "Insertion publique de rendez-vous" ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (
    slot_id IN (
      SELECT id FROM agent_slots WHERE is_available = true AND start_datetime > now()
    )
  );

-- Fonction pour marquer un créneau comme non disponible quand un rendez-vous est pris
CREATE OR REPLACE FUNCTION mark_slot_unavailable()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agent_slots 
  SET is_available = false, updated_at = now()
  WHERE id = NEW.slot_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour marquer automatiquement un créneau comme non disponible
CREATE TRIGGER on_appointment_created
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION mark_slot_unavailable();

-- Fonction pour libérer un créneau quand un rendez-vous est annulé
CREATE OR REPLACE FUNCTION release_slot_if_cancelled()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le statut passe à 'cancelled', libérer le créneau
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE agent_slots 
    SET is_available = true, updated_at = now()
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour libérer automatiquement un créneau si rendez-vous annulé
CREATE TRIGGER on_appointment_status_changed
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION release_slot_if_cancelled(); 