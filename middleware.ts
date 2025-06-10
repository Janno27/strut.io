import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Middleware qui gère l'authentification des routes
export async function middleware(req: NextRequest) {
  // Créer la réponse de base
  let res = NextResponse.next()

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
              maxAge: 60 * 60 * 24 * 7, // 1 semaine
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

    // Récupérer l'utilisateur avec gestion d'erreur
    const { data: { user }, error } = await supabase.auth.getUser()
    
    const { pathname } = req.nextUrl

    // Routes publiques (pas d'authentification requise)
    const publicRoutes = ['/login', '/register']
    const isPublicRoute = publicRoutes.includes(pathname)

    // Routes d'auth (pour éviter les boucles)
    const authRoutes = ['/auth/callback', '/auth/signout', '/auth/confirm', '/auth/verify-email']
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // Si c'est une route d'auth, laisser passer
    if (isAuthRoute) {
      return res
    }

    // Logs pour debug
    console.log('Middleware - Path:', pathname, 'User:', !!user, 'Error:', !!error)

    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
    if (!user && !isPublicRoute) {
      console.log('Redirecting to login:', pathname)
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Si l'utilisateur est connecté et essaie d'accéder aux pages d'auth
    if (user && isPublicRoute) {
      console.log('User authenticated, redirecting to home from:', pathname)
      return NextResponse.redirect(new URL('/', req.url))
    }

    return res
  } catch (error) {
    console.error('Erreur dans le middleware:', error)
    // En cas d'erreur, laisser passer la requête
    return res
  }
}

// Configuration des routes qui doivent passer par le middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - images folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|images).*)',
  ],
}