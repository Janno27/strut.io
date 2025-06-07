'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from './server';
import { UserRole } from './types';

/**
 * Action pour s'inscrire sur le site
 */
export async function signUp(
  formData: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
  }
) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
        role: formData.role,
      },
    },
  });
  
  if (error) {
    return { error: error.message };
  }
  
  // Insérer le profil dans la base de données
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: formData.email,
      full_name: formData.fullName,
      role: formData.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    if (profileError) {
      return { error: profileError.message };
    }
  }
  
  return { success: true, user: data.user };
}

/**
 * Action pour se connecter
 */
export async function signIn(formData: { email: string; password: string }) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return { success: true, user: data.user };
}

/**
 * Action pour se déconnecter
 */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  
  // Supprimer les cookies liés à l'authentification
  // Note: La suppression des cookies est gérée automatiquement par Supabase
  // lors de l'appel à signOut(). Nous n'avons pas besoin de le faire manuellement.
  
  redirect('/');
}

/**
 * Récupérer le profil de l'utilisateur actuel
 */
export async function getCurrentUser() {
  const supabase = createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { user: null, profile: null };
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  return { 
    user: session.user,
    profile
  };
} 