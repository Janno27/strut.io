import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Créer le client Supabase avec les cookies sécurisés
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );
  
  // Déconnecter l'utilisateur
  await supabase.auth.signOut();
  
  return response;
} 