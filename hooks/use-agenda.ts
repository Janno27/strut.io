"use client";

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createAnonymousClient } from '@/lib/supabase/anonymous';
import { AgentSlot, Appointment, SlotWithAppointment, CreateSlotData, CreateAppointmentData } from '@/lib/types/agenda';
import { useAuth } from '@/lib/auth/auth-provider';

export function useAgenda() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Créer un créneau (pour les agents)
  const createSlot = useCallback(async (slotData: CreateSlotData): Promise<AgentSlot | null> => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('agent_slots')
        .insert({
          ...slotData,
          agent_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du créneau');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Récupérer les créneaux d'un agent avec leurs rendez-vous
  const getAgentSlots = useCallback(async (agentId?: string): Promise<SlotWithAppointment[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const targetAgentId = agentId || user?.id;
      
      if (!targetAgentId) return [];

      // Récupérer les créneaux disponibles (slots)
      const { data: slots, error: slotsError } = await supabase
        .from('agent_slots')
        .select('*')
        .eq('agent_id', targetAgentId)
        .order('start_datetime', { ascending: true });

      if (slotsError) throw slotsError;

      // Récupérer les rendez-vous en tant que "slots virtuels"
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          agent_slots!inner (agent_id)
        `)
        .eq('agent_slots.agent_id', targetAgentId)
        .order('start_datetime', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      // Combiner les slots et les rendez-vous
      const allSlots: SlotWithAppointment[] = [
        // Slots de disponibilité
        ...(slots || []).map((slot: any) => ({
          ...slot,
          appointment: undefined
        })),
        // Rendez-vous comme "slots virtuels"
        ...(appointments || []).map((appointment: any) => ({
          id: `appointment_${appointment.id}`,
          agent_id: targetAgentId,
          start_datetime: appointment.start_datetime,
          end_datetime: appointment.end_datetime,
          title: appointment.model_name ? `RDV - ${appointment.model_name}` : 'Rendez-vous',
          description: appointment.notes || null,
          is_available: false,
          created_at: appointment.created_at,
          updated_at: appointment.updated_at,
          appointment: appointment
        }))
      ];

      // Trier par date de début
      return allSlots.sort((a, b) => 
        new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des créneaux');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Récupérer les créneaux disponibles (accès public pour les mannequins)
  const getAvailableSlots = useCallback(async (agentId: string): Promise<AgentSlot[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createAnonymousClient();
      const { data, error } = await supabase
        .from('agent_slots')
        .select('*')
        .eq('agent_id', agentId)
        .eq('is_available', true)
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as AgentSlot[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des créneaux disponibles');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les rendez-vous existants pour un agent (accès public)
  const getExistingAppointments = useCallback(async (agentId: string): Promise<Appointment[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createAnonymousClient();
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          agent_slots!inner (agent_id)
        `)
        .eq('agent_slots.agent_id', agentId)
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as Appointment[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des rendez-vous');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un rendez-vous (accès public pour les mannequins)
  const createAppointment = useCallback(async (appointmentData: CreateAppointmentData): Promise<Appointment | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createAnonymousClient();
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData as any)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Appointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du rendez-vous');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un rendez-vous en tant qu'agent connecté
  const createAppointmentAsAgent = useCallback(async (appointmentData: CreateAppointmentData): Promise<Appointment | null> => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData as any)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Appointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du rendez-vous');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);



  // Mettre à jour un créneau (pour les agents)
  const updateSlot = useCallback(async (slotId: string, slotData: Partial<CreateSlotData>): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('agent_slots')
        .update(slotData)
        .eq('id', slotId)
        .eq('agent_id', user.id);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du créneau');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mettre à jour un rendez-vous (pour les agents)
  const updateAppointment = useCallback(async (appointmentId: string, appointmentData: Partial<CreateAppointmentData>): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', appointmentId);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du rendez-vous');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Supprimer un créneau (pour les agents)
  const deleteSlot = useCallback(async (slotId: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('agent_slots')
        .delete()
        .eq('id', slotId)
        .eq('agent_id', user.id);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du créneau');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    createSlot,
    updateSlot,
    getAgentSlots,
    getAvailableSlots,
    getExistingAppointments,
    createAppointment,
    createAppointmentAsAgent,
    updateAppointment,
    deleteSlot,
  };
} 