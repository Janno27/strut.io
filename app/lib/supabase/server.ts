import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieOptions = {
                ...options,
                sameSite: 'lax' as const,
                secure: process.env.NODE_ENV === 'production',
                httpOnly: false, // Important pour que JS côté client puisse lire
                path: '/',
              }
              cookieStore.set(name, value, cookieOptions)
            })
          } catch (error) {
            // Cette erreur peut être ignorée si le middleware rafraîchit les sessions
            console.warn('Erreur lors du paramétrage des cookies:', error)
          }
        },
      },
    }
  )
}
