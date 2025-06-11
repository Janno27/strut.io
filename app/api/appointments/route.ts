import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Client Supabase avec la clé service (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Clé service pour bypass RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données requises
    if (!body.slot_id || !body.start_datetime || !body.end_datetime || !body.model_name) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Insérer le rendez-vous avec la clé service (bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        slot_id: body.slot_id,
        start_datetime: body.start_datetime,
        end_datetime: body.end_datetime,
        model_name: body.model_name,
        model_email: body.model_email || null,
        model_phone: body.model_phone || null,
        model_instagram: body.model_instagram || null,
        notes: body.notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 