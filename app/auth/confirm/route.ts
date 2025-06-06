import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  // Rediriger vers la page d'accueil si les paramètres sont manquants
  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/error?message=Paramètres de confirmation invalides', request.url));
  }

  try {
    const supabase = createClient();

    // Vérifier le token OTP
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (error) {
      return NextResponse.redirect(new URL(`/error?message=${error.message}`, request.url));
    }

    // Rediriger vers la page spécifiée ou la page d'accueil
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error('Erreur lors de la confirmation:', error);
    return NextResponse.redirect(new URL('/error?message=Erreur lors de la confirmation', request.url));
  }
} 