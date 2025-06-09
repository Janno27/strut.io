-- Ajout à la structure existante (sql/database_structure)

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

-- Trigger pour mettre à jour le timestamp
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
    (status = ANY (ARRAY['draft'::text, 'planned'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]))
  )
) TABLESPACE pg_default;

-- Trigger pour mettre à jour le timestamp
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
    (status = ANY (ARRAY['pending'::text, 'planned'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]))
  )
) TABLESPACE pg_default;

-- Trigger pour mettre à jour le timestamp
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

-- Politiques RLS (Row Level Security)

-- Active RLS sur les tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_models ENABLE ROW LEVEL SECURITY;

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