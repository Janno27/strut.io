"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAgenda } from '@/hooks/use-agenda';
import { Button } from '@/components/ui/button';
import { Clock, User, TrendingUp } from 'lucide-react';
import { SlotWithAppointment } from '@/lib/types/agenda';
import { AgentCalendar } from './agent-calendar';
import { Badge } from '@/components/ui/badge';
import { AgendaTabsSkeleton } from './skeletons/agenda-skeleton';

export function AgendaTabs() {
  const { profile } = useAuth();
  const { getAgentSlots, loading } = useAgenda();
  const [slots, setSlots] = useState<SlotWithAppointment[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadSlots = async () => {
    const agentSlots = await getAgentSlots();
    setSlots(agentSlots);
    setIsInitialLoading(false);
  };

  useEffect(() => {
    if (profile?.role === 'agent') {
      loadSlots();
    } else if (profile) {
      setIsInitialLoading(false);
    }
  }, [profile]);

  if (!profile || isInitialLoading) {
    return <AgendaTabsSkeleton />;
  }

  if (profile.role !== 'agent') {
    return (
      <div className="text-center text-muted-foreground">
        Cette fonctionnalité est réservée aux agents.
      </div>
    );
  }

  const upcomingAppointments = slots.filter(slot => 
    slot.appointment && new Date(slot.start_datetime) > new Date()
  ).slice(0, 5);

  const bookedSlots = slots.filter(slot => slot.appointment);

  // Calcul du taux de rendez-vous basé sur la durée
  const calculateAppointmentRate = () => {
    const availableSlots = slots.filter(slot => slot.is_available);
    const appointmentSlots = slots.filter(slot => slot.appointment);
    
    // Calculer le temps total des disponibilités (en minutes)
    const totalAvailableTime = availableSlots.reduce((total, slot) => {
      const start = new Date(slot.start_datetime);
      const end = new Date(slot.end_datetime);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60); // en minutes
      return total + duration;
    }, 0);
    
    // Calculer le temps total des rendez-vous (en minutes)
    const totalAppointmentTime = appointmentSlots.reduce((total, slot) => {
      const start = new Date(slot.start_datetime);
      const end = new Date(slot.end_datetime);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60); // en minutes
      return total + duration;
    }, 0);
    
    // Calculer le pourcentage
    if (totalAvailableTime === 0) return 0;
    return Math.round((totalAppointmentTime / totalAvailableTime) * 100);
  };

  const appointmentRate = calculateAppointmentRate();

  return (
    <div className="space-y-6">
      {/* Statistiques centrées */}
      <div className="flex justify-center items-center">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Rendez-vous</span>
            <span className="text-lg font-semibold">{bookedSlots.length}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Disponibles</span>
            <span className="text-lg font-semibold">{slots.filter(s => s.is_available).length}</span>
          </div>

          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Taux de rendez-vous</span>
            <span className="text-lg font-semibold">{appointmentRate}%</span>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="space-y-4">
        <AgentCalendar 
          slots={slots} 
          onSlotsChange={loadSlots} 
          upcomingAppointments={upcomingAppointments}
        />
      </div>

    </div>
  );
} 