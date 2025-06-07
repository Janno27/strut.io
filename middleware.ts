import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Créer le client Supabase avec les cookies sécurisés
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
          });
        },
      },
    }
  );
  
  // Récupérer la session de l'utilisateur
  const { data: { session } } = await supabase.auth.getSession();
  
  // Pour les pages protégées, rediriger vers la connexion si non authentifié
  const protectedPaths = ['/admin', '/models/edit', '/agent'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (isProtectedPath && !session) {
    // Rediriger vers la page de connexion
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 