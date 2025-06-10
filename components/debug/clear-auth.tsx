'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function ClearAuth() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const clearAuthData = () => {
    // Vider localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      
      // Vider les cookies d'authentification
      const cookiesToClear = [
        'sb-auth-token',
        'supabase-auth-token',
        'supabase.auth.token',
        'sb-access-token',
        'sb-refresh-token'
      ]
      
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
      })
      
      // Recharger la page
      window.location.reload()
    }
  }

  return (
    <div className="fixed bottom-20 right-4">
      <Button
        onClick={clearAuthData}
        variant="destructive"
        size="sm"
        className="bg-red-600 hover:bg-red-700"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Clear Auth
      </Button>
    </div>
  )
} 