"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAgenda } from '@/hooks/use-agenda';
import { Button } from '@/components/ui/button';
import { Clock, User, TrendingUp } from 'lucide-react';
import { SlotWithAppointment } from '@/lib/types/agenda';
import { AgentCalendar } from './agent-calendar';
import { Badge } from '@/components/ui/badge';

export function AgendaTabs() {
  const { profile } = useAuth();
  const { getAgentSlots, loading } = useAgenda();
  const [slots, setSlots] = useState<SlotWithAppointment[]>([]);

  const loadSlots = async () => {
    const agentSlots = await getAgentSlots();
    setSlots(agentSlots);
  };

  useEffect(() => {
    if (profile?.role === 'agent') {
      loadSlots();
    }
  }, [profile]);

  if (!profile) {
    return (
      <div className="text-center text-muted-foreground">
        Chargement...
      </div>
    );
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
        <AgentCalendar slots={slots} onSlotsChange={loadSlots} />
      </div>

      {/* Prochains rendez-vous */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Chargement...
          </div>
        ) : upcomingAppointments.length > 0 ? (
          <div className="space-y-2">
            {upcomingAppointments.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{slot.title || 'Rendez-vous'}</p>
                      {slot.appointment && (
                        <p className="text-sm font-medium text-blue-600">
                          avec {slot.appointment.model_name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(slot.start_datetime).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(slot.start_datetime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - {new Date(slot.end_datetime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    Confirmé
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Aucun rendez-vous à venir.
          </div>
        )}
      </div>

    </div>
  );
} 