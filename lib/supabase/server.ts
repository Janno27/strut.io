import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // @ts-ignore - le typage de Next.js pour cookies() est incompatible avec l'API de Supabase
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // @ts-ignore - le typage de Next.js pour cookies() est incompatible
          return cookies().get(name)?.value
        },
        set(name, value, options) {
          // Cette fonction ne fait rien en server component
          // Les cookies sont gérés par le middleware
        },
        remove(name, options) {
          // Cette fonction ne fait rien en server component
          // Les cookies sont gérés par le middleware
        }
      }
    }
  )
}
