import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  // Forcer le type pour résoudre l'erreur de typage
  const cookieStore = cookies() as any;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.warn(`Erreur cookie ${name}:`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            console.warn(`Erreur suppression cookie ${name}:`, error);
          }
        },
      },
      cookieOptions: {
        // Configuration cohérente avec le client navigateur
        secure: true, // Toujours sécurisé pour permettre SameSite=None
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 an
      },
      cookieEncoding: "base64url",
    }
  );
} 