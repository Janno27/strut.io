-- Mise à jour de la structure pour le système de shortlist et duplication de packages

-- 1. Ajouter une colonne pour identifier les mannequins shortlistés dans package_models
ALTER TABLE public.package_models 
ADD COLUMN is_shortlisted boolean DEFAULT false;

-- 2. Ajouter une colonne pour tracer la filiation des packages (duplication)
ALTER TABLE public.packages 
ADD COLUMN parent_package_id uuid NULL;

-- 3. Ajouter la contrainte de clé étrangère pour parent_package_id
ALTER TABLE public.packages 
ADD CONSTRAINT packages_parent_package_id_fkey 
FOREIGN KEY (parent_package_id) REFERENCES packages (id) ON DELETE SET NULL;

-- 4. Ajouter une colonne pour le type/version du package
ALTER TABLE public.packages 
ADD COLUMN package_type text DEFAULT 'original' CHECK (
  package_type IN ('original', 'revision')
);

-- 5. Ajouter des index pour améliorer les performances
CREATE INDEX idx_package_models_shortlisted ON package_models (package_id, is_shortlisted);
CREATE INDEX idx_packages_parent ON packages (parent_package_id);
CREATE INDEX idx_packages_type ON packages (package_type);

-- 6. Ajouter des commentaires pour documenter
COMMENT ON COLUMN package_models.is_shortlisted IS 'Indique si le mannequin fait partie de la shortlist du client pour ce package';
COMMENT ON COLUMN packages.parent_package_id IS 'ID du package parent en cas de duplication/révision';
COMMENT ON COLUMN packages.package_type IS 'Type de package: original (package initial), revision (itération avec mannequins shortlistés + nouveaux candidats)'; 