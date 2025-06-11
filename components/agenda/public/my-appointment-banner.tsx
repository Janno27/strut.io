"use client";

import { useState, useEffect } from 'react';
import { Appointment } from '@/lib/types/agenda';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, X } from 'lucide-react';

interface MyAppointmentBannerProps {
  agentId: string;
}

export function MyAppointmentBanner({ agentId }: MyAppointmentBannerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Récupérer les rendez-vous du localStorage pour cet agent
    const storageKey = `appointments_${agentId}`;
    const storedAppointments = localStorage.getItem(storageKey);
    
    if (storedAppointments) {
      try {
        const appointmentsList = JSON.parse(storedAppointments) as Appointment[];
        
        // Filtrer les rendez-vous futurs et les trier par date
        const now = new Date();
        const futureAppointments = appointmentsList
          .filter(appointment => {
            const appointmentDate = new Date(appointment.start_datetime);
            return appointmentDate > now;
          })
          .sort((a, b) => 
            new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
          );
        
        if (futureAppointments.length > 0) {
          setAppointments(futureAppointments);
          setIsVisible(true);
          
          // Nettoyer le localStorage des rendez-vous passés
          if (futureAppointments.length !== appointmentsList.length) {
            localStorage.setItem(storageKey, JSON.stringify(futureAppointments));
          }
        } else {
          // Aucun rendez-vous futur, supprimer du localStorage
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        console.error('Erreur lors de la lecture du localStorage:', error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [agentId]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Optionnel : supprimer du localStorage si l'utilisateur ferme
    // localStorage.removeItem(`appointments_${agentId}`);
  };

  if (!isVisible || appointments.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg mr-3">
            <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Vos rendez-vous
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {appointments.length} rendez-vous confirmé{appointments.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Grille des rendez-vous - 3 par ligne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((appointment, index) => {
          const appointmentDate = new Date(appointment.start_datetime);
          const endDate = new Date(appointment.end_datetime);
          
          return (
            <div key={appointment.id || index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md dark:shadow-gray-900/25 transition-shadow">
              <div className="space-y-3">
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></div>
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                      {appointment.model_name}
                    </span>
                  </div>
                  <div className="px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-400 dark:bg-green-500 rounded-full"></div>
                  </div>
                </div>
                
                {/* Date */}
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div className="font-medium">
                    {appointmentDate.toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>
                
                {/* Heure */}
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Clock className="h-3 w-3 mr-2" />
                  <span className="text-xs font-medium">
                    {appointmentDate.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} - {endDate.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Contact (optionnel et discret) */}
                {(appointment.model_email || appointment.model_phone) && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    {appointment.model_phone && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        📞 {appointment.model_phone}
                      </div>
                    )}
                    {appointment.model_email && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        ✉️ {appointment.model_email}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 