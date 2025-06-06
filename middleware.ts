import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/app/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  try {
    // Créer un client Supabase pour le middleware
    const { supabase, response } = createClient(request);

    // Vérifier la session utilisateur
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Si l'utilisateur n'est pas authentifié et tente d'accéder à des pages protégées
    if (!session && request.nextUrl.pathname.startsWith('/admin')) {
      // Rediriger vers la page de connexion
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Continuer avec la réponse modifiée pour maintenir les cookies de session
    return response;
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