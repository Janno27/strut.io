import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // Déconnexion côté serveur
  await supabase.auth.signOut()
  
  // Construire l'URL de redirection appropriée
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectUrl = new URL('/login', origin)
  
  // Créer la réponse de redirection
  const response = NextResponse.redirect(redirectUrl, {
    status: 302,
  })
  
  // Nettoyer explicitement les cookies d'authentification
  const cookieNames = [
    'sb-auth-token',
    'supabase-auth-token',
    'supabase.auth.token',
    'sb-access-token',
    'sb-refresh-token'
  ]
  
  cookieNames.forEach(cookieName => {
    response.cookies.set({
      name: cookieName,
      value: '',
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
  })
  
  // Headers pour éviter la mise en cache
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  
  return response
}
