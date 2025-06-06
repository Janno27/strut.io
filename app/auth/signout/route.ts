import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Vérifier si un utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Déconnecter l'utilisateur
      await supabase.auth.signOut();
    }
    
    // Revalider le chemin pour mettre à jour l'interface utilisateur
    revalidatePath('/', 'layout');
    
    // Rediriger vers la page de connexion
    return NextResponse.redirect(new URL('/login', request.url), {
      status: 302,
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.redirect(new URL('/error?message=Erreur lors de la déconnexion', request.url));
  }
} 