'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function ClearAuth() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const clearAuth = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      
      // Nettoyer le localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        
        // Nettoyer les cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Forcer le rechargement
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error)
    }
  }

  return (
    <div className="fixed bottom-4 left-4">
      <Button 
        onClick={clearAuth}
        variant="destructive"
        size="sm"
      >
        🧹 Clear Auth
      </Button>
    </div>
  )
} 