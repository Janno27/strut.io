import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    
    // Créer un client Supabase pour le middleware
    const supabase = createMiddlewareClient({ req: request, res });

    // Synchroniser les cookies de session
    await supabase.auth.getSession();

    // Si l'utilisateur n'est pas authentifié et tente d'accéder à des pages protégées
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && request.nextUrl.pathname.startsWith('/admin')) {
      // Rediriger vers la page de connexion
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Continuer avec la réponse modifiée pour maintenir les cookies de session
    return res;
  } catch (error) {
    console.error('Erreur dans le middleware:', error);
    return NextResponse.next();
  }
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