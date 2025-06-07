// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Crée une instance unique du client Supabase avec une configuration adaptée
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  // Configuration optimisée pour éviter les problèmes de parsing et maintenir la session
  cookieOptions: {
    name: 'sb-auth',
    path: '/',
    // SameSite=None est nécessaire pour que les cookies fonctionnent en cross-site (important pour Render)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    // domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
    secure: true, // Toujours sécurisé pour permettre SameSite=None
    maxAge: 60 * 60 * 24 * 365, // 1 an
  },
  cookieEncoding: 'base64url', // Force l'encodage à base64url au lieu de base64-json
  // Ces options sont gérées automatiquement par la librairie
  // persistSession: true,
  // autoRefreshToken: true,
  // detectSessionInUrl: true
});

// Pour la compatibilité avec le code existant
export function createClient() {
  return supabase;
}
