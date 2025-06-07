"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { UserProfile } from "../lib/supabase/supabase";
import { supabase } from "../lib/supabase/client";
import { useRouter } from "next/navigation";

interface AuthContextProps {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, role: string, fullName: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Vérifier si le navigateur est basé sur Chromium (Chrome, Opera, Edge)
  const isChromiumBased = typeof window !== 'undefined' && 
    (navigator.userAgent.includes('Chrome') || 
     navigator.userAgent.includes('Opera') || 
     navigator.userAgent.includes('Edge'));

  // Fonction pour rafraîchir manuellement la session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erreur lors du rafraîchissement de la session:", error);
        return;
      }
      
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        
        // Récupérer le profil utilisateur
        if (data.session.user) {
          await fetchUserProfile(data.session.user.id);
        }
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement de la session:", error);
    }
  };

  useEffect(() => {
    // Vérifier s'il y a déjà une session
    const checkSession = async () => {
      setIsLoading(true);
      try {
        // Récupérer la session depuis les cookies
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la récupération de la session:", error);
          return;
        }
        
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          
          // Récupérer le profil utilisateur
          if (data.session.user) {
            await fetchUserProfile(data.session.user.id);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Pour les navigateurs Chromium, ajouter un intervalle pour rafraîchir la session
    let refreshInterval: NodeJS.Timeout | null = null;
    if (isChromiumBased && process.env.NODE_ENV === 'production') {
      refreshInterval = setInterval(refreshSession, 5 * 60 * 1000); // Rafraîchir toutes les 5 minutes
    }

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log("Événement d'authentification:", event);
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          if (currentSession.user) {
            await fetchUserProfile(currentSession.user.id);
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          
          // Rediriger vers la page d'accueil si l'utilisateur est déconnecté
          if (event === 'SIGNED_OUT') {
            router.push('/');
            router.refresh();
          }
        }
        
        setIsLoading(false);
      }
    );

    // Nettoyer l'abonnement et l'intervalle
    return () => {
      subscription.unsubscribe();
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [router, isChromiumBased]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return;
      }

      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      // Forcer une actualisation après la connexion pour s'assurer que les cookies sont correctement enregistrés
      router.refresh();

      return { data: data.session, error: null };
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return { data: null, error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, role: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Forcer une actualisation après l'inscription pour s'assurer que les cookies sont correctement enregistrés
      router.refresh();

      return { data: data.session, error: null };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      return { data: null, error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setUser(null);
      setSession(null);
      
      // Forcer une actualisation après la déconnexion
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
