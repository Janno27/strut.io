import { createClient as createBrowserClient } from '@supabase/supabase-js'

// Instance unique du client anonyme
let anonymousClient: ReturnType<typeof createBrowserClient> | null = null

// Créer un client Supabase sans authentification pour les pages publiques
export function createAnonymousClient() {
  // Réutiliser l'instance existante si disponible
  if (anonymousClient) return anonymousClient
  
  // Sinon, créer une nouvelle instance
  anonymousClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false, // Ne pas persister la session
        autoRefreshToken: false, // Ne pas rafraîchir le token automatiquement
        storageKey: 'supabase-anonymous-storage-key', // Clé de stockage distincte pour éviter les conflits
      },
      global: {
        // Pas de mode d'authentification spécifique pour cet accès anonyme
        headers: {
          'X-Client-Info': 'shared-access'
        }
      }
    }
  )
  
  return anonymousClient
} 