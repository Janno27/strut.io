import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            })
          } catch (error) {
            // Les cookies ne peuvent pas être définis dans certains contextes server-side
            // Ce n'est pas grave, le middleware gère les cookies
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({
              name,
              value: '',
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 0,
            })
          } catch (error) {
            // Les cookies ne peuvent pas être supprimés dans certains contextes server-side
            // Ce n'est pas grave, le middleware gère les cookies
          }
        }
      },
      auth: {
        persistSession: false, // Important : pas de persistance sur le serveur
        autoRefreshToken: false, // Pas de refresh automatique sur le serveur
        detectSessionInUrl: false, // Pas de détection d'URL sur le serveur
      }
    }
  )
}
