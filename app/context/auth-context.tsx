"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { UserProfile } from "../lib/supabase/types";

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
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Cette fonction vérifie la session au chargement
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Récupérer la session actuelle
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Récupérer le profil
          if (currentSession.user) {
            await fetchUserProfile(currentSession.user.id);
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'authentification:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Abonnement aux changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Événement d'authentification:", event);
        
        // Mettre à jour l'état
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
        
        // Forcer le rechargement des données
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          router.refresh();
        }
        
        setIsLoading(false);
      }
    );

    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Récupérer le profil de l'utilisateur
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

  // Connexion avec email et mot de passe
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      // Forcer le rechargement de la page pour mettre à jour les cookies
      router.refresh();

      return { data: data.session, error: null };
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return { data: null, error: error as Error };
    }
  };

  // Inscription
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

      // Forcer le rechargement de la page
      router.refresh();

      return { data: data.session, error: null };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      return { data: null, error: error as Error };
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setUser(null);
      setSession(null);
      
      // Rediriger vers la page d'accueil et forcer le rechargement
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