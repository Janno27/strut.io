-- Création de la table models pour stocker les informations des mannequins
CREATE TABLE public.models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  height INTEGER NOT NULL, -- Taille en cm
  bust INTEGER NOT NULL, -- Tour de poitrine en cm
  waist INTEGER NOT NULL, -- Tour de taille en cm
  hips INTEGER NOT NULL, -- Tour de hanches en cm
  shoe_size NUMERIC(4,1) NOT NULL, -- Pointure
  eye_color TEXT NOT NULL,
  hair_color TEXT NOT NULL,
  instagram TEXT, -- Identifiant Instagram (facultatif)
  models_com_link TEXT, -- Lien vers models.com (facultatif)
  main_image TEXT NOT NULL, -- URL de l'image principale
  additional_images TEXT[], -- Tableau d'URLs pour les images supplémentaires
  agent_id UUID NOT NULL REFERENCES auth.users(id), -- ID de l'agent qui gère ce modèle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer la Row Level Security (RLS)
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre aux agents de voir leurs propres modèles
CREATE POLICY "Les agents peuvent voir leurs propres modèles" 
  ON public.models 
  FOR SELECT 
  USING (auth.uid() = agent_id);

-- Créer une politique pour permettre aux agents de modifier leurs propres modèles
CREATE POLICY "Les agents peuvent modifier leurs propres modèles" 
  ON public.models 
  FOR UPDATE 
  USING (auth.uid() = agent_id);

-- Créer une politique pour permettre aux agents de supprimer leurs propres modèles
CREATE POLICY "Les agents peuvent supprimer leurs propres modèles" 
  ON public.models 
  FOR DELETE 
  USING (auth.uid() = agent_id);

-- Créer une politique pour permettre aux agents d'insérer des modèles
CREATE POLICY "Les agents peuvent insérer des modèles" 
  ON public.models 
  FOR INSERT 
  WITH CHECK (auth.uid() = agent_id);

-- Créer une politique pour permettre aux administrateurs de voir tous les modèles
CREATE POLICY "Les administrateurs peuvent voir tous les modèles" 
  ON public.models 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Créer une politique pour permettre aux administrateurs de modifier tous les modèles
CREATE POLICY "Les administrateurs peuvent modifier tous les modèles" 
  ON public.models 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Créer une politique pour permettre aux administrateurs de supprimer tous les modèles
CREATE POLICY "Les administrateurs peuvent supprimer tous les modèles" 
  ON public.models 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Créer une politique pour permettre aux administrateurs d'insérer des modèles
CREATE POLICY "Les administrateurs peuvent insérer des modèles" 
  ON public.models 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Créer une politique pour permettre aux utilisateurs anonymes et connectés de voir tous les modèles
CREATE POLICY "Tous les utilisateurs peuvent voir les modèles" 
  ON public.models 
  FOR SELECT 
  USING (true);

-- Fonction pour mettre à jour le timestamp 'updated_at' lors des mises à jour
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le timestamp 'updated_at'
CREATE TRIGGER update_models_timestamp
BEFORE UPDATE ON public.models
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column(); 