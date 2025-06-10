import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Middleware qui gère l'authentification des routes
export async function middleware(req: NextRequest) {
  let res = NextResponse.next()

  const { pathname } = req.nextUrl

  // Routes qui doivent toujours passer (API, static, auth)
  const alwaysAllowRoutes = [
    '/api',
    '/_next',
    '/favicon.ico',
    '/public',
    '/images',
    '/auth/callback',
    '/auth/signout',
    '/auth/confirm',
    '/auth/verify-email'
  ]

  const shouldSkipAuth = alwaysAllowRoutes.some(route => pathname.startsWith(route))
  
  if (shouldSkipAuth) {
    return res
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return req.cookies.get(name)?.value
          },
          set(name, value, options) {
            res.cookies.set({
              name,
              value,
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            })
          },
          remove(name, options) {
            res.cookies.set({
              name,
              value: '',
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 0,
            })
          }
        }
      }
    )

    // Routes publiques
    const publicRoutes = ['/login', '/register']
    const isPublicRoute = publicRoutes.includes(pathname)

    // Vérifier la session de façon plus robuste
    const { data: { session } } = await supabase.auth.getSession()
    const hasValidSession = session && session.user && session.expires_at && new Date(session.expires_at * 1000) > new Date()

    // Logs de debug seulement en développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`Middleware: ${pathname}, Session: ${!!hasValidSession}, Public: ${isPublicRoute}`)
    }

    // Redirection uniquement si nécessaire
    if (!hasValidSession && !isPublicRoute) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (hasValidSession && isPublicRoute) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return res
  } catch (error) {
    // En cas d'erreur, logs et continuation
    console.error('Middleware error:', error)
    return res
  }
}

// Configuration des routes qui doivent passer par le middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except API routes and static files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|images).*)',
  ],
}