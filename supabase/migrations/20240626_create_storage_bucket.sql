-- Création du bucket storage pour les images des modèles
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('models', 'models', true, false, 10485760, '{image/png,image/jpeg,image/jpg,image/gif}')
ON CONFLICT DO NOTHING;

-- Création des politiques pour le bucket models
-- Permettre à tous les utilisateurs authentifiés de lire les fichiers
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Models Storage Read Policy',
  '(auth.role() = ''authenticated'')',
  'models'
) ON CONFLICT DO NOTHING;

-- Permettre aux agents et admin de télécharger des fichiers
INSERT INTO storage.policies (name, definition, bucket_id, operation)
VALUES (
  'Models Storage Upload Policy',
  '(auth.role() = ''authenticated'' AND (EXISTS (SELECT 1 FROM auth.users JOIN public.profiles ON auth.users.id = public.profiles.id WHERE auth.users.id = auth.uid() AND (public.profiles.role = ''admin'' OR public.profiles.role = ''agent''))))',
  'models',
  'INSERT'
) ON CONFLICT DO NOTHING;

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