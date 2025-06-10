'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: string[]
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (requireRole && profile && !requireRole.includes(profile.role)) {
        router.push('/') // Rediriger vers l'accueil si le rôle n'est pas autorisé
        return
      }
    }
  }, [user, profile, loading, router, requireRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // La redirection est en cours
  }

  if (requireRole && profile && !requireRole.includes(profile.role)) {
    return null // La redirection est en cours
  }

  return <>{children}</>
} 