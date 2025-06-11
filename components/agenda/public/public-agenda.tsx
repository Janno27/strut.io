"use client";

import { useState, useEffect } from 'react';
import { useAgenda } from '@/hooks/use-agenda';
import { AgentSlot } from '@/lib/types/agenda';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { BookingModal } from '../booking-modal';

interface PublicAgendaProps {
  agentId: string;
}

export function PublicAgenda({ agentId }: PublicAgendaProps) {
  const { getAvailableSlots, loading } = useAgenda();
  const [slots, setSlots] = useState<AgentSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AgentSlot | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const loadSlots = async () => {
      const availableSlots = await getAvailableSlots(agentId);
      setSlots(availableSlots);
    };

    if (agentId) {
      loadSlots();
    }
  }, [agentId, getAvailableSlots]);

  const handleBookSlot = (slot: AgentSlot) => {
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    // Recharger les créneaux pour mettre à jour la disponibilité
    const loadSlots = async () => {
      const availableSlots = await getAvailableSlots(agentId);
      setSlots(availableSlots);
    };
    loadSlots();
    setIsBookingModalOpen(false);
    setSelectedSlot(null);
    
    // Déclencher un refresh de la bannière des rendez-vous si nécessaire
    window.dispatchEvent(new CustomEvent('appointmentUpdated'));
  };

  // Grouper les créneaux par date
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = new Date(slot.start_datetime).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, AgentSlot[]>);

  // Trier les dates
  const sortedDates = Object.keys(slotsByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full">
          <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Réserver un rendez-vous
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choisissez un créneau disponible pour prendre rendez-vous
          </p>
        </div>
      </div>

      {/* Créneaux disponibles */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des créneaux...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            Aucun créneau disponible
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Il n'y a actuellement aucun créneau de disponible. Revenez plus tard !
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((dateStr) => {
            const date = new Date(dateStr);
            const daySlots = slotsByDate[dateStr].sort((a, b) => 
              new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
            );

            return (
              <div key={dateStr} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {date.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {daySlots.map((slot) => (
                    <div key={slot.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {slot.title || 'Créneau disponible'}
                          </h3>
                          {slot.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {slot.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(slot.start_datetime).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} - {new Date(slot.end_datetime).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Disponible
                          </Badge>
                        </div>
                        
                        <Button 
                          onClick={() => handleBookSlot(slot)}
                          className="w-full"
                          size="sm"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Réserver ce créneau
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de réservation */}
      {selectedSlot && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedSlot(null);
          }}
          slot={selectedSlot}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
} 