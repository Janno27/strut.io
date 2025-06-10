'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
  initialized: boolean
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
    loading: true,
    initialized: false
  })

  const supabase = createClient()
  const router = useRouter()

  // Fonction pour charger le profil utilisateur
  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
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
  }, [supabase])

  // Fonction pour rafraîchir le profil
  const refreshProfile = useCallback(async () => {
    if (state.user) {
      const profile = await loadProfile(state.user.id)
      setState(prev => ({ ...prev, profile }))
    }
  }, [state.user, loadProfile])

  // Initialisation de l'authentification
  useEffect(() => {
    if (state.initialized) return

    let mounted = true
    let authSubscription: any = null

    const initialize = async () => {
      try {
        // Vérifier l'utilisateur actuel
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (!mounted) return

        if (user && !error) {
          const profile = await loadProfile(user.id)
          setState({
            user,
            profile,
            loading: false,
            initialized: true
          })
        } else {
          setState({
            user: null,
            profile: null,
            loading: false,
            initialized: true
          })
        }

        // Écouter les changements d'authentification APRÈS l'initialisation
        authSubscription = supabase.auth.onAuthStateChange(
          async (event: any, session: any) => {
            if (!mounted) return

            console.log('Auth event:', event)

            // Gérer uniquement les événements importants
            if (event === 'SIGNED_IN' && session?.user) {
              const profile = await loadProfile(session.user.id)
              setState({
                user: session.user,
                profile,
                loading: false,
                initialized: true
              })
            } else if (event === 'SIGNED_OUT') {
              setState({
                user: null,
                profile: null,
                loading: false,
                initialized: true
              })
            }
            // Ignorer TOKEN_REFRESHED pour éviter les conflits
          }
        )
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
        if (mounted) {
          setState({
            user: null,
            profile: null,
            loading: false,
            initialized: true
          })
        }
      }
    }

    initialize()

    return () => {
      mounted = false
      if (authSubscription) {
        authSubscription.data.subscription.unsubscribe()
      }
    }
  }, [state.initialized, supabase, loadProfile])

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
        // NE PAS rediriger ici - laisser le middleware gérer
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

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: 'Une erreur inattendue est survenue' 
      }
    }
  }

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      // Mettre à jour l'état immédiatement
      setState({ 
        user: null, 
        profile: null, 
        loading: false,
        initialized: true
      })
      
      // Déconnexion Supabase
      await supabase.auth.signOut()
      
      // Attendre un petit délai puis rediriger
      setTimeout(() => {
        router.push('/login')
      }, 100)
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
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