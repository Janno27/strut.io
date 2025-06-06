'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  email: string
  role: string
  full_name: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, role: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Fonction pour rafraîchir la session
  const refreshSession = async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Erreur lors du rafraîchissement:', error)
        return
      }

      if (currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)
        
        if (currentSession.user) {
          await fetchUserProfile(currentSession.user.id)
        }
      } else {
        setSession(null)
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la session:', error)
    }
  }

  useEffect(() => {
    let mounted = true

    // Initialisation de l'authentification
    const initializeAuth = async () => {
      setIsLoading(true)
      
      try {
        // Récupérer la session actuelle
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur lors de l\'initialisation:', error)
          return
        }

        if (mounted && currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          
          if (currentSession.user) {
            await fetchUserProfile(currentSession.user.id)
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Événement d\'authentification:', event, currentSession?.user?.id || 'no user')
        
        if (!mounted) return

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          
          if (currentSession.user) {
            await fetchUserProfile(currentSession.user.id)
          }
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }

        // Forcer le rechargement pour synchroniser avec le serveur
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          router.refresh()
        }

        setIsLoading(false)
      }
    )

    // Rafraîchir la session périodiquement (toutes les 5 minutes)
    const interval = setInterval(refreshSession, 5 * 60 * 1000)

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  // Récupérer le profil utilisateur
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Erreur lors de la récupération du profil:", error)
        return
      }

      if (data) {
        setProfile(data as UserProfile)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error)
    }
  }

  // Connexion
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Attendre que la session soit mise à jour
      await refreshSession()
      
      // Rediriger après connexion réussie
      router.push('/dashboard')
      router.refresh()

      return { error: null }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error)
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  // Inscription
  const signUp = async (email: string, password: string, role: string, fullName: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
          },
        },
      })

      if (error) {
        throw error
      }

      return { error: null }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  // Déconnexion
  const signOut = async () => {
    try {
      setIsLoading(true)
      
      // Déconnexion Supabase
      await supabase.auth.signOut()
      
      // Nettoyer l'état local
      setProfile(null)
      setUser(null)
      setSession(null)
      
      // Rediriger vers la page d'accueil
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    profile,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }
  return context
}
