import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () => {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // @ts-ignore - Ignorer les erreurs de type pour résoudre le problème de cookies
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // @ts-ignore - Ignorer les erreurs de type pour résoudre le problème de cookies
            cookieStore.set({
              name,
              value,
              ...options,
              // Assurez-vous que les cookies sont configurés correctement pour Render.com
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
            });
          } catch (error) {
            console.error('Erreur lors de la définition du cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // @ts-ignore - Ignorer les erreurs de type pour résoudre le problème de cookies
            cookieStore.delete({
              name,
              ...options,
              // Assurez-vous que les cookies sont supprimés correctement
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
            });
          } catch (error) {
            console.error('Erreur lors de la suppression du cookie:', error);
          }
        },
      },
    }
  );
}; 