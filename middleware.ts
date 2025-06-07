import { type NextRequest } from 'next/server';
import { updateSession, authMiddleware } from './app/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // D'abord, mettre à jour la session pour tous les chemins
  const updatedResponse = await updateSession(request);
  
  // Ensuite, vérifier si l'utilisateur est authentifié pour les chemins protégés
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/agent') || 
      request.nextUrl.pathname.startsWith('/model')) {
    return authMiddleware(request);
  }
  
  // Continuer avec la réponse mise à jour
  return updatedResponse;
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