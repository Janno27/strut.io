import { createBrowserClient, CookieOptions } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof window !== 'undefined') {
            try {
              const value = document.cookie
                .split('; ')
                .find(row => row.startsWith(name + '='))
                ?.split('=')[1]
              return value ? decodeURIComponent(value) : undefined
            } catch (error) {
              console.warn(`Erreur lors de la lecture du cookie ${name}:`, error)
              return undefined
            }
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          if (typeof window !== 'undefined') {
            try {
              const cookieOptions = {
                ...options,
                sameSite: 'lax' as const,
                path: '/',
                maxAge: options?.maxAge || 60 * 60 * 24 * 7,
              }

              const optionsString = Object.entries(cookieOptions)
                .map(([key, val]) => {
                  if (val === true) return key
                  if (val === false) return ''
                  if (key === 'maxAge') return `max-age=${val}`
                  return `${key}=${val}`
                })
                .filter(Boolean)
                .join('; ')

              document.cookie = `${name}=${encodeURIComponent(value)}; ${optionsString}`
            } catch (error) {
              console.warn(`Erreur lors de l'écriture du cookie ${name}:`, error)
            }
          }
        },
        remove(name: string, options: CookieOptions) {
          if (typeof window !== 'undefined') {
            try {
              this.set(name, '', { 
                ...options, 
                maxAge: 0, 
                expires: new Date(0)
              })
            } catch (error) {
              console.warn(`Erreur lors de la suppression du cookie ${name}:`, error)
            }
          }
        },
      },
    }
  )
}
