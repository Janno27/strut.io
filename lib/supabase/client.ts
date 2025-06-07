import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof window !== 'undefined') {
            return document.cookie
              .split('; ')
              .find(row => row.startsWith(name + '='))
              ?.split('=')[1]
          }
        },
        set(name: string, value: string, options: any) {
          if (typeof window !== 'undefined') {
            const cookieOptions = {
              ...options,
              sameSite: 'lax' as const,
              secure: process.env.NODE_ENV === 'production',
              path: '/',
            }
            
            const optionsString = Object.entries(cookieOptions)
              .map(([key, val]) => {
                if (val === true) return key
                if (val === false) return ''
                return `${key}=${val}`
              })
              .filter(Boolean)
              .join('; ')
            
            document.cookie = `${name}=${value}; ${optionsString}`
          }
        },
        remove(name: string, options: any) {
          if (typeof window !== 'undefined') {
            this.set(name, '', { ...options, maxAge: 0 })
          }
        },
      },
    }
  )
}
