-- Politiques d'accès public pour les tables nécessaires au partage
-- Ces politiques permettent un accès en lecture seule aux utilisateurs anonymes

-- Politique pour les packages
CREATE POLICY "Accès public en lecture pour les packages"
ON public.packages
FOR SELECT
TO anon
USING (true); -- Permet l'accès en lecture à tous les packages

-- Politique pour les projets
CREATE POLICY "Accès public en lecture pour les projets"
ON public.projects
FOR SELECT
TO anon
USING (true); -- Permet l'accès en lecture à tous les projets

-- Politique pour les clients
CREATE POLICY "Accès public en lecture pour les clients"
ON public.clients
FOR SELECT
TO anon
USING (true); -- Permet l'accès en lecture à tous les clients

-- Politique pour les modèles
CREATE POLICY "Accès public en lecture pour les modèles"
ON public.models
FOR SELECT
TO anon
USING (true); -- Permet l'accès en lecture à tous les modèles

-- Politique pour les relations package-modèles
CREATE POLICY "Accès public en lecture pour les relations package-modèles"
ON public.package_models
FOR SELECT
TO anon
USING (true); -- Permet l'accès en lecture à toutes les relations package-modèles

-- Note: ces politiques permettent l'accès en lecture seule à toutes les données
-- Dans un environnement de production, vous pourriez vouloir restreindre davantage
-- en utilisant des conditions plus spécifiques dans la clause USING.
-- Par exemple:
-- USING (package_id IN (SELECT id FROM packages WHERE public = true)) 