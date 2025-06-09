import { createBrowserClient } from '@supabase/ssr'

// Instance unique du client authentifié
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Réutiliser l'instance existante si disponible
  if (browserClient) return browserClient
  
  // Sinon, créer une nouvelle instance
  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'supabase-auth-storage-key', // Clé de stockage distincte
      }
    }
  )
  
  return browserClient
}
