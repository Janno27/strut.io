import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface ServerAuthCheckProps {
  children: React.ReactNode
  redirectTo?: string
}

export async function ServerAuthCheck({ 
  children, 
  redirectTo = '/login' 
}: ServerAuthCheckProps) {
  const supabase = await createClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // Si pas de session ou erreur, rediriger
    if (!session || error) {
      redirect(redirectTo)
    }
    
    return <>{children}</>
  } catch (error) {
    console.error('Erreur lors de la vérification d\'authentification:', error)
    redirect(redirectTo)
  }
} 