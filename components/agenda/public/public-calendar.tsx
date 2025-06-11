"use client";

import { useState, useEffect } from 'react';
import { useAgenda } from '@/hooks/use-agenda';
import { AgentSlot, Appointment } from '@/lib/types/agenda';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BookingModal } from '../booking-modal';

interface PublicCalendarProps {
  agentId: string;
  onAppointmentSuccess?: () => void;
}

export function PublicCalendar({ agentId, onAppointmentSuccess }: PublicCalendarProps) {
  const { getAvailableSlots, getExistingAppointments, loading } = useAgenda();
  const [slots, setSlots] = useState<AgentSlot[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [userAppointments, setUserAppointments] = useState<AgentSlot[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AgentSlot | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const loadSlots = async () => {
      const availableSlots = await getAvailableSlots(agentId);
      setSlots(availableSlots);
    };

    const loadExistingAppointments = async () => {
      const appointments = await getExistingAppointments(agentId);
      setExistingAppointments(appointments);
    };

    const loadUserAppointments = () => {
      const storageKey = `appointments_${agentId}`;
      const storedAppointments = localStorage.getItem(storageKey);
      
      if (storedAppointments) {
        try {
          const appointmentsList = JSON.parse(storedAppointments);
          
          // Filtrer les rendez-vous futurs et les transformer en format AgentSlot
          const now = new Date();
          const futureAppointments = appointmentsList
            .filter((appointmentData: any) => {
              const appointmentDate = new Date(appointmentData.start_datetime);
              return appointmentDate > now;
            })
            .map((appointmentData: any) => ({
              id: `user_appointment_${appointmentData.id}`,
              agent_id: agentId,
              start_datetime: appointmentData.start_datetime,
              end_datetime: appointmentData.end_datetime,
              title: `Votre RDV - ${appointmentData.model_name}`,
              description: appointmentData.notes || null,
              is_available: false,
              created_at: appointmentData.created_at,
              updated_at: appointmentData.updated_at,
            }));
          
          setUserAppointments(futureAppointments);
          
          // Nettoyer le localStorage des rendez-vous passés
          if (futureAppointments.length !== appointmentsList.length) {
            const validAppointments = appointmentsList.filter((appointmentData: any) => {
              const appointmentDate = new Date(appointmentData.start_datetime);
              return appointmentDate > now;
            });
            
            if (validAppointments.length > 0) {
              localStorage.setItem(storageKey, JSON.stringify(validAppointments));
            } else {
              localStorage.removeItem(storageKey);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la lecture du localStorage:', error);
          localStorage.removeItem(storageKey);
        }
      }
    };

    if (agentId) {
      loadSlots();
      loadExistingAppointments();
      loadUserAppointments();
    }
  }, [agentId, getAvailableSlots, getExistingAppointments]);

  // Navigation des dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Utilitaires calendrier
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Commence le lundi
    return new Date(d.setDate(diff));
  };

  const getMonthCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOfCalendar = getStartOfWeek(firstDay);
    
    const days = [];
    const current = new Date(startOfCalendar);
    
    // 6 semaines pour couvrir tous les cas
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      days.push(weekDays);
    }
    
    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = getStartOfWeek(selectedDate || currentDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  // Obtenir les créneaux pour une date (incluant les rendez-vous utilisateur)
  const getSlotsForDate = (date: Date) => {
    const availableSlots = slots.filter(slot => {
      const slotDate = new Date(slot.start_datetime);
      return slotDate.toDateString() === date.toDateString();
    });

    const userSlots = userAppointments.filter(appointment => 
      new Date(appointment.start_datetime).toDateString() === date.toDateString()
    );

    return [...availableSlots, ...userSlots].sort((a, b) => 
      new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
    );
  };

  // Vérifier si un créneau de 15 minutes est déjà pris
  const isTimeSlotTaken = (startTime: Date, endTime: Date) => {
    return existingAppointments.some(appointment => {
      const appointmentStart = new Date(appointment.start_datetime);
      const appointmentEnd = new Date(appointment.end_datetime);
      
      // Vérifier s'il y a un chevauchement
      return (startTime < appointmentEnd && endTime > appointmentStart);
    });
  };

  // Décomposer un créneau en sous-créneaux de 15 minutes (en excluant les créneaux pris)
  const decomposeSlotInto15MinSlots = (slot: AgentSlot) => {
    const startTime = new Date(slot.start_datetime);
    const endTime = new Date(slot.end_datetime);
    const subSlots = [];

    const current = new Date(startTime);
    
    while (current < endTime) {
      const slotEnd = new Date(current);
      slotEnd.setMinutes(current.getMinutes() + 15);
      
      // Ne pas dépasser la fin du créneau original
      if (slotEnd > endTime) {
        slotEnd.setTime(endTime.getTime());
      }

      // Vérifier si ce créneau de 15 minutes n'est pas déjà pris
      if (!isTimeSlotTaken(current, slotEnd)) {
        subSlots.push({
          ...slot,
          start_datetime: current.toISOString(),
          end_datetime: slotEnd.toISOString(),
          id: `${slot.id}_${current.getTime()}`, // ID unique pour chaque sous-créneau
          originalSlot: slot // Référence au créneau original
        });
      }

      current.setMinutes(current.getMinutes() + 15);
    }

    return subSlots;
  };

  // Obtenir tous les sous-créneaux de 15 minutes pour une date
  const get15MinSlotsForDate = (date: Date) => {
    const daySlots = getSlotsForDate(date);
    const allSubSlots: (AgentSlot & { originalSlot?: AgentSlot })[] = [];

    daySlots.forEach(slot => {
      // Si c'est un rendez-vous utilisateur, ne pas le décomposer
      if (slot.id.toString().startsWith('user_appointment_')) {
        allSubSlots.push(slot as AgentSlot & { originalSlot?: AgentSlot });
      } else {
        // Décomposer seulement les créneaux disponibles
        const subSlots = decomposeSlotInto15MinSlots(slot);
        allSubSlots.push(...subSlots);
      }
    });

    return allSubSlots.sort((a, b) => 
      new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
    );
  };

  // Générer les créneaux de 15 minutes pour la vue semaine
  const getTimeSlots = () => {
    const timeSlots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return timeSlots;
  };

  // Gérer la sélection d'un jour (passer en vue semaine)
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    setView('week');
  };

  // Retour à la vue mois
  const handleBackToMonth = () => {
    setView('month');
    setSelectedDate(null);
  };

  // Gérer la réservation
  const handleBookSlot = (slot: AgentSlot & { originalSlot?: AgentSlot }) => {
    // Si c'est un sous-créneau, on utilise l'ID et les données du créneau original
    // mais on garde les dates spécifiques du sous-créneau pour l'affichage
    const bookingSlot = slot.originalSlot ? {
      ...slot.originalSlot,
      // On garde l'ID original pour la base de données
      id: slot.originalSlot.id,
      // Mais on affiche les dates du sous-créneau dans le modal
      start_datetime: slot.start_datetime,
      end_datetime: slot.end_datetime,
      // S'assurer que l'agent_id est présent
      agent_id: slot.originalSlot.agent_id || agentId,
    } : {
      ...slot,
      // S'assurer que l'agent_id est présent
      agent_id: slot.agent_id || agentId,
    };
    
    setSelectedSlot(bookingSlot);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    // Recharger les créneaux, les rendez-vous existants et le rendez-vous utilisateur
    const loadSlots = async () => {
      const availableSlots = await getAvailableSlots(agentId);
      setSlots(availableSlots);
    };

    const loadExistingAppointments = async () => {
      const appointments = await getExistingAppointments(agentId);
      setExistingAppointments(appointments);
    };
    
    const loadUserAppointments = () => {
      const storageKey = `appointments_${agentId}`;
      const storedAppointments = localStorage.getItem(storageKey);
      
      if (storedAppointments) {
        try {
          const appointmentsList = JSON.parse(storedAppointments);
          
          const userAppointmentSlots = appointmentsList.map((appointmentData: any) => ({
            id: `user_appointment_${appointmentData.id}`,
            agent_id: agentId,
            start_datetime: appointmentData.start_datetime,
            end_datetime: appointmentData.end_datetime,
            title: `Votre RDV - ${appointmentData.model_name}`,
            description: appointmentData.notes || null,
            is_available: false,
            created_at: appointmentData.created_at,
            updated_at: appointmentData.updated_at,
          }));
          
          setUserAppointments(userAppointmentSlots);
        } catch (error) {
          console.error('Erreur lors de la lecture du localStorage:', error);
        }
      }
    };
    
    loadSlots();
    loadExistingAppointments();
    loadUserAppointments();
    setIsBookingModalOpen(false);
    setSelectedSlot(null);
    
    // Notifier le composant parent de la mise à jour
    onAppointmentSuccess?.();
  };

  // Titre de la date courante
  const getCurrentDateTitle = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
      });
    } else {
      const startWeek = getStartOfWeek(currentDate);
      const endWeek = new Date(startWeek);
      endWeek.setDate(startWeek.getDate() + 6);
      return `${startWeek.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      })} - ${endWeek.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      })}`;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des créneaux...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {view === 'week' && (
            <Button variant="outline" onClick={handleBackToMonth}>
              ← Retour au mois
            </Button>
          )}
          <Button variant="outline" onClick={goToToday}>
            Aujourd'hui
          </Button>
        </div>
        
        {/* Spacer pour pousser le sélecteur à droite */}
        <div className="flex-1"></div>
        
        {/* Sélecteur de navigation discret à droite */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground font-medium min-w-[180px] text-center">
            {getCurrentDateTitle()}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Vue mois */}
      {view === 'month' && (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="border-b p-3 bg-muted/50 text-center font-medium">
                {day}
              </div>
            ))}
          </div>
          
          {getMonthCalendar().map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((day, dayIndex) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                const daySubSlots = get15MinSlotsForDate(day);
                const hasSlots = daySubSlots.length > 0;
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`border-l border-b min-h-[100px] p-2 cursor-pointer hover:bg-muted/30 transition-colors ${
                      !isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
                    } ${hasSlots ? 'ring-1 ring-green-200 bg-green-50/50' : ''}`}
                    onClick={() => hasSlots && handleDayClick(day)}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      isToday ? 'text-blue-600 font-bold' : ''
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {hasSlots && (
                      <div className="space-y-1">
                        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {daySubSlots.length} créneau{daySubSlots.length > 1 ? 'x' : ''} de 15min
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Vue semaine avec créneaux de 15 minutes */}
      {view === 'week' && (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-8 bg-muted/50">
            <div className="p-3 border-r font-medium text-center">Heure</div>
            {getWeekDays().map((day, index) => (
              <div key={index} className="p-3 border-r font-medium text-center">
                <div className="text-sm">
                  {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <div className={`text-lg ${
                  day.toDateString() === new Date().toDateString() 
                    ? 'font-bold text-blue-600' 
                    : ''
                }`}>
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="max-h-[600px] overflow-y-auto">
            {getTimeSlots().map((timeSlot) => (
              <div key={timeSlot} className="grid grid-cols-8 border-b border-gray-100 min-h-[40px]">
                <div className="p-2 border-r bg-muted/30 text-xs font-medium flex items-center">
                  {timeSlot}
                </div>
                
                {getWeekDays().map((day, dayIndex) => {
                  const daySubSlots = get15MinSlotsForDate(day);
                  const slotAtTime = daySubSlots.find(slot => {
                    const slotStart = new Date(slot.start_datetime);
                    const slotTime = `${slotStart.getHours().toString().padStart(2, '0')}:${slotStart.getMinutes().toString().padStart(2, '0')}`;
                    return slotTime === timeSlot;
                  });
                  
                  return (
                    <div key={dayIndex} className="p-1 border-r border-gray-100 flex items-center">
                      {slotAtTime && (
                        <Button
                          variant="outline"
                          size="sm"
                          className={`w-full text-xs ${
                            slotAtTime.id.toString().startsWith('user_appointment_')
                              ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 cursor-default'
                              : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                          }`}
                          onClick={() => {
                            if (!slotAtTime.id.toString().startsWith('user_appointment_')) {
                              handleBookSlot(slotAtTime);
                            }
                          }}
                          disabled={slotAtTime.id.toString().startsWith('user_appointment_')}
                        >
                          <div className="truncate">
                            {slotAtTime.id.toString().startsWith('user_appointment_') ? 'Votre RDV' : timeSlot}
                          </div>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
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