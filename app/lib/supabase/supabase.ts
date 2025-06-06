import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement pour Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les utilisateurs
export type UserRole = 'admin' | 'agent' | 'client' | 'model';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Vérifier si un utilisateur a un rôle spécifique
export const hasRole = (role: UserRole, userRole?: UserRole): boolean => {
  if (!userRole) return false;
  return userRole === role;
};

// Vérifier si un utilisateur a besoin de se connecter
export const requiresLogin = (role?: UserRole): boolean => {
  if (!role) return false;
  return ['admin', 'agent', 'model'].includes(role);
}; 