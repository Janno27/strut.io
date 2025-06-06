-- Création de la table profiles pour stocker les informations supplémentaires des utilisateurs
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer la Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Créer une politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Créer une fonction pour gérer la création automatique de profils lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un déclencheur pour appeler la fonction lors de la création d'un nouvel utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 