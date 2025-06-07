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
    sameSite: 'lax',
    domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365, // 1 an
  },
  cookieEncoding: 'base64url', // Force l'encodage à base64url au lieu de base64-json
});

// Pour la compatibilité avec le code existant
export function createClient() {
  return supabase;
}
