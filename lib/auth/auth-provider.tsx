'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true
  })

  const supabase = createClient()

  // Fonction pour charger le profil utilisateur
  const loadProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erreur lors du chargement du profil:', error)
        return null
      }

      return data as Profile
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      return null
    }
  }

  // Fonction pour rafraîchir le profil
  const refreshProfile = async () => {
    if (state.user) {
      const profile = await loadProfile(state.user.id)
      setState(prev => ({ ...prev, profile }))
    }
  }

  // Initialisation et écoute des changements d'authentification
  useEffect(() => {
    // Fonction d'initialisation
    const initialize = async () => {
      try {
        // Récupérer la session actuelle
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error)
          setState({ user: null, profile: null, loading: false })
          return
        }

        if (session?.user) {
          const profile = await loadProfile(session.user.id)
          setState({
            user: session.user,
            profile,
            loading: false
          })
        } else {
          setState({ user: null, profile: null, loading: false })
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
        setState({ user: null, profile: null, loading: false })
      }
    }

    initialize()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('Événement d\'authentification:', event)

        if (session?.user) {
          const profile = await loadProfile(session.user.id)
          setState({
            user: session.user,
            profile,
            loading: false
          })
        } else {
          setState({ user: null, profile: null, loading: false })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fonction de connexion
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { 
          success: false, 
          error: error.message.includes('Invalid login credentials') 
            ? 'Email ou mot de passe incorrect'
            : error.message
        }
      }

      if (data.user) {
        // Ne pas faire de redirection ici, laisser le middleware s'en occuper
        return { success: true }
      }

      return { success: false, error: 'Erreur lors de la connexion' }
    } catch (error) {
      return { 
        success: false, 
        error: 'Une erreur inattendue est survenue' 
      }
    }
  }

  // Fonction d'inscription
  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      })

      setState(prev => ({ ...prev, loading: false }))

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      return { 
        success: false, 
        error: 'Une erreur inattendue est survenue' 
      }
    }
  }

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      await supabase.auth.signOut()
      
      setState({ user: null, profile: null, loading: false })
      
      // Redirection simple et directe
      window.location.href = '/login'
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
} 