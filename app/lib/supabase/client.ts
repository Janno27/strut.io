// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Crée une instance unique du client Supabase avec une configuration adaptée
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  // Utiliser l'encodage base64url pour éviter les problèmes de parsing JSON
  cookieOptions: {
    name: 'sb-auth',
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  },
  cookieEncoding: 'base64url' // Force l'encodage à base64url au lieu de base64-json
});

// Pour la compatibilité avec le code existant
export function createClient() {
  return supabase;
}
