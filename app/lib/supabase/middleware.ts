// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware pour rafraîchir les sessions Supabase
 * @param req Requête entrante
 * @returns NextResponse modifiée avec les cookies de session mis à jour
 */
export async function updateSession(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    const supabase = createMiddlewareClient({ req, res });
    
    // Rafraîchir la session et mettre à jour les cookies
    await supabase.auth.getSession();
    
    return res;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la session:', error);
    return res;
  }
}

// Middleware pour les routes protégées
export async function authMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  try {
    // Vérifier si l'utilisateur est authentifié
    const { data: { session } } = await supabase.auth.getSession();
    
    // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/admin') || 
                            req.nextUrl.pathname.startsWith('/agent') ||
                            req.nextUrl.pathname.startsWith('/model');
    
    if (!session && isProtectedRoute) {
      // Rediriger vers la page de connexion
      const redirectUrl = new URL('/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    return res;
  } catch (error) {
    console.error('Erreur dans le middleware d\'authentification:', error);
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
