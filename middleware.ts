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

  // Routes publiques
  const publicRoutes = ['/login', '/register', '/shared']
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/shared')

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

    // Utiliser getUser() qui est sécurisé
    const { data: { user }, error } = await supabase.auth.getUser()
    
    const isAuthenticated = user && !error

    // Logs de debug seulement en développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`Middleware: ${pathname}, Auth: ${!!isAuthenticated}, Public: ${isPublicRoute}`)
    }

    // Redirection simplifiée - éviter les boucles
    if (!isAuthenticated && !isPublicRoute) {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }

    if (isAuthenticated && isPublicRoute) {
      const homeUrl = new URL('/', req.url)
      return NextResponse.redirect(homeUrl)
    }

    return res
  } catch (error) {
    console.error('Erreur middleware:', error)
    // En cas d'erreur, permettre l'accès aux routes publiques seulement
    if (isPublicRoute) {
      return res
    }
    // Sinon rediriger vers login
    return NextResponse.redirect(new URL('/login', req.url))
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