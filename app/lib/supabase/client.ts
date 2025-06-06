// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Crée une instance unique du client Supabase
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Pour la compatibilité avec le code existant
export function createClient() {
  return supabase;
}
