import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Construire l'URL de redirection de façon plus robuste
      const forwardedHost = request.headers.get('x-forwarded-host')
      const forwardedProto = request.headers.get('x-forwarded-proto')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      let redirectUrl: string
      
      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`
      } else if (forwardedHost) {
        const protocol = forwardedProto || 'https'
        redirectUrl = `${protocol}://${forwardedHost}${next}`
      } else {
        redirectUrl = `${origin}${next}`
      }

      // Créer une réponse avec redirection et cookies appropriés
      const response = NextResponse.redirect(redirectUrl)
      
      // S'assurer que les cookies sont correctement configurés pour la production
      if (!isLocalEnv) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
        response.headers.set('Pragma', 'no-cache')
      }
      
      return response
    }
  }

  // Rediriger vers page d'erreur en cas de problème
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
