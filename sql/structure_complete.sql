-- Extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fonction pour mettre à jour automatiquement les timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL,
  full_name TEXT NULL,
  avatar_url TEXT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Trigger pour profiles
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles 
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Storage Bucket models
-- Création du bucket storage pour les images des modèles
INSERT INTO storage.buckets (id, name, public)
VALUES ('models', 'models', true); -- 'public' est défini sur true pour permettre l'accès public aux images

-- Créer une politique pour permettre l'insertion dans le bucket models
CREATE POLICY "Tous les utilisateurs peuvent uploader des images" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'models');

-- Créer une politique pour permettre de voir les images du bucket models
CREATE POLICY "Tous les utilisateurs peuvent voir les images" 
  ON storage.objects 
  FOR SELECT 
  TO public
  USING (bucket_id = 'models');

-- Créer une politique pour permettre la mise à jour des images
CREATE POLICY "Les utilisateurs authentifiés peuvent mettre à jour leurs images" 
  ON storage.objects 
  FOR UPDATE 
  TO authenticated
  USING (bucket_id = 'models' AND owner = auth.uid());

-- Créer une politique pour permettre la suppression des images
CREATE POLICY "Les utilisateurs authentifiés peuvent supprimer leurs images" 
  ON storage.objects 
  FOR DELETE 
  TO authenticated
  USING (bucket_id = 'models' AND owner = auth.uid());

-- Table models
CREATE TABLE public.models (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  height INTEGER NOT NULL,
  bust INTEGER NOT NULL,
  waist INTEGER NOT NULL,
  hips INTEGER NOT NULL,
  shoe_size NUMERIC(4, 1) NOT NULL,
  eye_color TEXT NOT NULL,
  hair_color TEXT NOT NULL,
  instagram TEXT NULL,
  models_com_link TEXT NULL,
  main_image TEXT NOT NULL,
  additional_images TEXT[] NULL,
  agent_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  age NUMERIC NULL,
  description TEXT NULL,
  CONSTRAINT models_pkey PRIMARY KEY (id),
  CONSTRAINT models_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES auth.users (id),
  CONSTRAINT models_gender_check CHECK (
    (
      gender = ANY (ARRAY['male'::TEXT, 'female'::TEXT])
    )
  )
) TABLESPACE pg_default;

-- Trigger pour models
CREATE TRIGGER update_models_timestamp
BEFORE UPDATE ON models 
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Table clients
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  notes TEXT,
  agent_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Trigger pour clients
CREATE TRIGGER update_clients_timestamp
BEFORE UPDATE ON clients 
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Table projets
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  client_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients (id) ON DELETE CASCADE,
  CONSTRAINT projects_status_check CHECK (
    (status = ANY (ARRAY['draft'::TEXT, 'planned'::TEXT, 'in_progress'::TEXT, 'completed'::TEXT, 'cancelled'::TEXT]))
  )
) TABLESPACE pg_default;

-- Trigger pour projets
CREATE TRIGGER update_projects_timestamp
BEFORE UPDATE ON projects 
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Table packages
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  price NUMERIC(10, 2),
  deadline DATE,
  project_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT packages_pkey PRIMARY KEY (id),
  CONSTRAINT packages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects (id) ON DELETE CASCADE,
  CONSTRAINT packages_status_check CHECK (
    (status = ANY (ARRAY['pending'::TEXT, 'planned'::TEXT, 'in_progress'::TEXT, 'completed'::TEXT, 'cancelled'::TEXT]))
  )
) TABLESPACE pg_default;

-- Trigger pour packages
CREATE TRIGGER update_packages_timestamp
BEFORE UPDATE ON packages 
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Table de liaison entre packages et models
CREATE TABLE public.package_models (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  package_id UUID NOT NULL,
  model_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT package_models_pkey PRIMARY KEY (id),
  CONSTRAINT package_models_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages (id) ON DELETE CASCADE,
  CONSTRAINT package_models_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models (id) ON DELETE CASCADE,
  CONSTRAINT package_models_unique UNIQUE (package_id, model_id)
) TABLESPACE pg_default;

-- Fonctions et vues pour récupérer les projets d'un agent
CREATE OR REPLACE FUNCTION get_agent_projects(agent_uuid UUID)
RETURNS TABLE (
  project_id UUID,
  project_name TEXT,
  project_description TEXT,
  project_status TEXT,
  project_start_date DATE,
  project_end_date DATE,
  client_id UUID,
  client_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS project_id,
    p.name AS project_name,
    p.description AS project_description,
    p.status AS project_status,
    p.start_date AS project_start_date,
    p.end_date AS project_end_date,
    c.id AS client_id,
    c.name AS client_name
  FROM 
    projects p
  JOIN 
    clients c ON p.client_id = c.id
  WHERE 
    c.agent_id = agent_uuid
  ORDER BY 
    p.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour récupérer les packages d'un projet
CREATE OR REPLACE FUNCTION get_project_packages(project_uuid UUID)
RETURNS TABLE (
  package_id UUID,
  package_name TEXT,
  package_description TEXT,
  package_status TEXT,
  package_price NUMERIC(10, 2),
  package_deadline DATE,
  model_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS package_id,
    p.name AS package_name,
    p.description AS package_description,
    p.status AS package_status,
    p.price AS package_price,
    p.deadline AS package_deadline,
    COUNT(pm.model_id) AS model_count
  FROM 
    packages p
  LEFT JOIN 
    package_models pm ON p.id = pm.package_id
  WHERE 
    p.project_id = project_uuid
  GROUP BY 
    p.id
  ORDER BY 
    p.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour récupérer les mannequins d'un package
CREATE OR REPLACE FUNCTION get_package_models(package_uuid UUID)
RETURNS TABLE (
  model_id UUID,
  first_name TEXT,
  last_name TEXT,
  gender TEXT,
  height INTEGER,
  bust INTEGER,
  waist INTEGER,
  hips INTEGER,
  main_image TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id AS model_id,
    m.first_name,
    m.last_name,
    m.gender,
    m.height,
    m.bust,
    m.waist,
    m.hips,
    m.main_image
  FROM 
    models m
  JOIN 
    package_models pm ON m.id = pm.model_id
  WHERE 
    pm.package_id = package_uuid
  ORDER BY 
    m.first_name, m.last_name;
END;
$$ LANGUAGE plpgsql;

-- Politiques RLS (Row Level Security)

-- Active RLS sur les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_models ENABLE ROW LEVEL SECURITY;

-- Politique pour profiles: un utilisateur peut voir/modifier uniquement son profil
CREATE POLICY "Les utilisateurs peuvent voir leur profil" ON profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid());

-- Politique pour models: un agent peut voir/modifier uniquement ses mannequins
CREATE POLICY "Les agents peuvent voir leurs mannequins" ON models
  FOR ALL
  TO authenticated
  USING (agent_id = auth.uid());

-- Politique pour clients: un agent peut voir/modifier uniquement ses clients
CREATE POLICY "Les agents peuvent voir leurs clients" ON clients
  FOR ALL
  TO authenticated
  USING (agent_id = auth.uid());

-- Politique pour projets: un agent peut voir/modifier uniquement les projets de ses clients
CREATE POLICY "Les agents peuvent voir les projets de leurs clients" ON projects
  FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE agent_id = auth.uid()
    )
  );

-- Politique pour packages: un agent peut voir/modifier uniquement les packages des projets de ses clients
CREATE POLICY "Les agents peuvent voir les packages des projets de leurs clients" ON packages
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE c.agent_id = auth.uid()
    )
  );

-- Politique pour package_models: un agent peut voir/modifier uniquement les associations des packages de ses projets
CREATE POLICY "Les agents peuvent voir les associations modèles-packages de leurs projets" ON package_models
  FOR ALL
  TO authenticated
  USING (
    package_id IN (
      SELECT pkg.id FROM packages pkg
      JOIN projects p ON pkg.project_id = p.id
      JOIN clients c ON p.client_id = c.id
      WHERE c.agent_id = auth.uid()
    )
  );

-- Données de test (optionnel)
-- Insérer un utilisateur administrateur (exécuter dans l'interface SQL de Supabase)
-- INSERT INTO auth.users (id, email, role, encrypted_password) VALUES 
--   ('00000000-0000-0000-0000-000000000000', 'admin@exemple.com', 'authenticated', 'encrypted_password_here');

-- INSERT INTO public.profiles (id, full_name, role) VALUES 
--   ('00000000-0000-0000-0000-000000000000', 'Administrateur', 'admin');

-- -- Créer un client de test
-- INSERT INTO public.clients (name, contact_name, email, agent_id) VALUES 
--   ('Client Test', 'Contact Test', 'contact@client-test.com', '00000000-0000-0000-0000-000000000000');

-- -- Créer un projet de test
-- INSERT INTO public.projects (name, description, status, client_id) VALUES 
--   ('Projet Test', 'Description du projet test', 'draft', (SELECT id FROM clients LIMIT 1));

-- -- Créer un mannequin de test
-- INSERT INTO public.models (first_name, last_name, gender, height, bust, waist, hips, shoe_size, eye_color, hair_color, main_image, agent_id) VALUES 
--   ('Prénom', 'Nom', 'female', 175, 90, 60, 90, 39, 'blue', 'brown', 'https://example.com/image.jpg', '00000000-0000-0000-0000-000000000000'); 