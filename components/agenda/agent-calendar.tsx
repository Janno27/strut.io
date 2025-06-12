"use client";

import { useState, useEffect } from 'react';
import { SlotWithAppointment } from '@/lib/types/agenda';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAgenda } from '@/hooks/use-agenda';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, Trash2, CalendarDays, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContextMenuPopover } from './context-menu-popover';
import { CreateEventModal } from './create-event-modal';
import { SlotContextMenu } from './slot-context-menu';
import { ConvertAppointmentModal } from './convert-appointment-modal';

type CalendarView = 'day' | 'week' | 'month';

interface AgentCalendarProps {
  slots: SlotWithAppointment[];
  onSlotsChange: () => void;
  upcomingAppointments?: SlotWithAppointment[];
}

export function AgentCalendar({ slots, onSlotsChange, upcomingAppointments = [] }: AgentCalendarProps) {
  const { deleteSlot, loading } = useAgenda();
  const { toast } = useToast();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // États pour le menu contextuel et les modales
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    clickedDate: null as Date | null,
    clickedTime: null as string | null,
  });
  
  const [eventModal, setEventModal] = useState({
    isOpen: false,
    eventType: 'availability' as 'availability' | 'appointment',
    prefilledData: undefined as { date: string; startTime: string; endTime: string } | undefined,
    editingSlot: undefined as SlotWithAppointment | undefined,
    viewOnly: false,
  });

  // États pour le menu contextuel des créneaux
  const [slotContextMenu, setSlotContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    slot: null as SlotWithAppointment | null,
  });

  // État pour le modal de conversion en mannequin
  const [convertModelModal, setConvertModelModal] = useState({
    isOpen: false,
    appointmentData: null as SlotWithAppointment | null,
  });

  // Fonctions de gestion des actions
  const handleDeleteSlot = async (slotId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      const success = await deleteSlot(slotId);
      if (success) {
        toast({
          title: "Succès",
          description: "Le créneau a été supprimé.",
        });
        onSlotsChange();
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de la suppression du créneau.",
          variant: "destructive",
        });
      }
    }
  };



  // Fonctions de navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Fonction pour fermer le menu contextuel lors d'un clic ailleurs
  useEffect(() => {
    const handleClickAway = () => {
      setContextMenu(prev => ({ ...prev, isOpen: false }));
    };

    if (contextMenu.isOpen) {
      document.addEventListener('click', handleClickAway);
      return () => document.removeEventListener('click', handleClickAway);
    }
  }, [contextMenu.isOpen]);

  // Gestion du clic droit sur les zones vides du calendrier
  const handleContextMenu = (e: React.MouseEvent, date: Date, calendarContainer?: HTMLElement) => {
    e.preventDefault();
    
    let calculatedTime: string | null = null;
    
    // Calculer l'heure basée sur la position Y du clic pour les vues jour/semaine
    if (view === 'week' || view === 'day') {
      calculatedTime = calculateTimeFromYPosition(e, calendarContainer);
    }
    
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      clickedDate: date,
      clickedTime: calculatedTime,
    });
  };

  // Calculer l'heure basée sur la position Y du clic
  const calculateTimeFromYPosition = (e: React.MouseEvent, container?: HTMLElement): string | null => {
    if (!container) return null;
    
    const rect = container.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const containerHeight = rect.height;
    
    // Calculer l'heure entre 8h et 20h (12 heures)
    const startHour = 8;
    const endHour = 20;
    const totalHours = endHour - startHour;
    
    const hourProgress = Math.max(0, Math.min(1, relativeY / containerHeight));
    const targetHour = startHour + (hourProgress * totalHours);
    
    // Arrondir aux 30 minutes les plus proches
    const roundedHour = Math.floor(targetHour);
    const minutes = (targetHour - roundedHour) >= 0.5 ? 30 : 0;
    
    // S'assurer que l'heure est dans les limites
    const finalHour = Math.max(startHour, Math.min(endHour - 1, roundedHour));
    
    return `${finalHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Calculer l'heure en fonction de la position du clic (pour la vue semaine/jour)
  const calculateTimeFromPosition = (date: Date, time?: string): { startTime: string; endTime: string } => {
    let startTime = '09:00';
    let endTime = '10:00';

    if (time) {
      startTime = time;
      const [hours, minutes] = time.split(':').map(Number);
      // Créer des créneaux d'1 heure par défaut
      const endHours = hours + 1;
      endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // S'assurer que l'heure de fin ne dépasse pas 20h
      if (endHours > 20) {
        endTime = '20:00';
      }
    } else {
      // Si pas de temps spécifique, utiliser l'heure actuelle arrondie
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        const currentHour = Math.max(8, Math.min(19, now.getHours()));
        const currentMinute = now.getMinutes();
        const roundedMinutes = currentMinute >= 30 ? 30 : 0;
        startTime = `${currentHour.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
        
        const endHour = currentHour + 1;
        endTime = `${Math.min(20, endHour).toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
      }
    }

    return { startTime, endTime };
  };

  // Ouvrir la modale avec les données pré-remplies
  const openEventModal = (eventType: 'availability' | 'appointment') => {
    if (!contextMenu.clickedDate) return;

    const { startTime, endTime } = calculateTimeFromPosition(
      contextMenu.clickedDate, 
      contextMenu.clickedTime || undefined
    );

    setEventModal({
      isOpen: true,
      eventType,
      prefilledData: {
        date: contextMenu.clickedDate.toISOString().split('T')[0],
        startTime,
        endTime,
      },
      editingSlot: undefined,
      viewOnly: false,
    });
  };

  const closeEventModal = () => {
    setEventModal({
      isOpen: false,
      eventType: 'availability',
      prefilledData: undefined,
      editingSlot: undefined,
      viewOnly: false,
    });
  };

  // Fermer le menu contextuel des créneaux
  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as Element;
      // Ne ferme pas le menu si on clique à l'intérieur du menu contextuel
      if (target.closest('[data-slot-context-menu]')) {
        return;
      }
      setSlotContextMenu(prev => ({ ...prev, isOpen: false }));
    };

    if (slotContextMenu.isOpen) {
      document.addEventListener('click', handleClickAway);
      return () => document.removeEventListener('click', handleClickAway);
    }
  }, [slotContextMenu.isOpen]);

  // Gestion du clic droit sur un créneau
  const handleSlotContextMenu = (e: React.MouseEvent, slot: SlotWithAppointment) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSlotContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      slot,
    });
  };

  // Ouvrir la modale d'édition
  const openEditModal = (slot: SlotWithAppointment) => {
    const eventType = slot.appointment ? 'appointment' : 'availability';
    
    setEventModal({
      isOpen: true,
      eventType,
      prefilledData: undefined,
      editingSlot: slot,
      viewOnly: false,
    });
  };

  // Ouvrir la modale en mode visualisation (non-édition)
  const openViewModal = (slot: SlotWithAppointment) => {
    const eventType = slot.appointment ? 'appointment' : 'availability';
    
    setEventModal({
      isOpen: true,
      eventType,
      prefilledData: undefined,
      editingSlot: slot,
      viewOnly: true,
    });
  };

  // Supprimer un créneau avec confirmation
  const handleDeleteSlotFromContext = async (slot: SlotWithAppointment) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce ${slot.appointment ? 'rendez-vous' : 'créneau'} ?`)) {
      const success = await deleteSlot(slot.id);
      if (success) {
        toast({
          title: "Succès",
          description: `${slot.appointment ? 'Le rendez-vous' : 'Le créneau'} a été supprimé.`,
        });
        onSlotsChange();
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de la suppression.",
          variant: "destructive",
        });
      }
    }
  };

  // Gérer la conversion d'un rendez-vous en mannequin
  const handleConvertToModel = (slot: SlotWithAppointment) => {
    if (slot.appointment) {
      setConvertModelModal({
        isOpen: true,
        appointmentData: slot,
      });
    }
  };

  // Fermer le modal de conversion
  const handleCloseConvertModal = () => {
    setConvertModelModal({
      isOpen: false,
      appointmentData: null,
    });
  };

  // Gérer la création du mannequin après conversion
  const handleModelConverted = () => {
    toast({
      title: "Conversion réussie",
      description: "Le rendez-vous a été converti en profil mannequin avec succès.",
    });
    handleCloseConvertModal();
  };

  // Fonctions utilitaires pour le calendrier
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Commence le lundi
    return new Date(d.setDate(diff));
  };

  const getWeekDays = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getMonthCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
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

  // Fonction pour obtenir les créneaux d'une date spécifique
  const getSlotsForDate = (date: Date) => {
    return slots.filter(slot => {
      const slotDate = new Date(slot.start_datetime);
      return slotDate.toDateString() === date.toDateString();
    }).sort((a, b) => {
      // Trier par heure de début, puis par type (disponibilités d'abord, rendez-vous après pour l'affichage)
      const timeA = new Date(a.start_datetime).getTime();
      const timeB = new Date(b.start_datetime).getTime();
      
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      
      // À heure égale, disponibilités d'abord (pour être en arrière-plan)
      const aIsAppointment = !!a.appointment;
      const bIsAppointment = !!b.appointment;
      
      if (aIsAppointment && !bIsAppointment) return 1;
      if (!aIsAppointment && bIsAppointment) return -1;
      
      return 0;
    });
  };

  // Configuration de la grille horaire
  const HOUR_HEIGHT = 60; // Hauteur en pixels pour une heure
  const START_HOUR = 8;
  const END_HOUR = 20;
  const TOTAL_HOURS = END_HOUR - START_HOUR;

  // Calculer la position et la hauteur d'un créneau
  const calculateSlotPosition = (slot: SlotWithAppointment) => {
    const startTime = new Date(slot.start_datetime);
    const endTime = new Date(slot.end_datetime);
    
    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    const endHour = endTime.getHours() + endTime.getMinutes() / 60;
    
    const top = Math.max(0, (startHour - START_HOUR) * HOUR_HEIGHT);
    const height = Math.max(30, (endHour - startHour) * HOUR_HEIGHT - 2); // Minimum 30px, -2px pour les bordures
    
    return { top, height };
  };

  // Composant pour afficher un créneau positionné
  const PositionedSlotCard = ({ slot, style = {} }: { slot: SlotWithAppointment; style?: React.CSSProperties }) => {
    const startTime = new Date(slot.start_datetime);
    const endTime = new Date(slot.end_datetime);
    const isAppointment = !!slot.appointment;
    
    // Z-index plus élevé pour les rendez-vous (priorité visuelle)
    const zIndex = isAppointment ? 15 : 10;
    
    // Contenu pour le tooltip
    const tooltipContent = [
      `${isAppointment ? '📅 Rendez-vous' : '🕐 Disponibilité'}`,
      slot.title && `Titre: ${slot.title}`,
      `Horaires: ${startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
      slot.appointment && `Mannequin: ${slot.appointment.model_name}`,
      slot.appointment?.model_email && `Email: ${slot.appointment.model_email}`,
      slot.appointment?.model_phone && `Tél: ${slot.appointment.model_phone}`,
      slot.description && `Description: ${slot.description}`,
    ].filter(Boolean).join('\n');
    
    return (
      <div 
        className={`absolute left-1 right-1 group/slot overflow-hidden text-xs p-1 rounded shadow-sm border cursor-pointer hover:shadow-lg hover:z-50 transition-all ${
          isAppointment 
            ? 'bg-purple-200 border-purple-300 text-purple-900 shadow-lg ring-2 ring-purple-100 dark:bg-purple-300 dark:border-purple-400 dark:text-purple-950' 
            : 'bg-green-100 border-green-300 text-green-900 dark:bg-green-900 dark:text-green-100 opacity-90'
        }`}
        style={{ ...style, zIndex }}
        onClick={() => openViewModal(slot)}
        onContextMenu={(e) => handleSlotContextMenu(e, slot)}
        title={tooltipContent}
      >
        <div className="overflow-hidden h-full flex flex-col">
          <div className="flex items-center justify-between mb-0.5 min-h-0">
            <div className="font-medium truncate text-xs flex-1 min-w-0">
              <span className="mr-1">{isAppointment ? '📅' : '🕐'}</span>
              <span className="truncate">{slot.title || (isAppointment ? 'RDV' : 'Dispo')}</span>
            </div>
            {isAppointment && (
              <div className="text-xs bg-purple-800/20 px-1 rounded ml-1 shrink-0">
                RDV
              </div>
            )}
          </div>
          
          <div className={`text-xs truncate ${isAppointment ? 'opacity-90' : 'opacity-75'} min-h-0`}>
            {startTime.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })} - {endTime.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          
          {slot.appointment && (
            <div className="text-xs opacity-95 truncate mt-0.5 font-medium bg-purple-800/20 px-1 rounded min-h-0 flex-shrink-0">
              <span className="truncate">👤 {slot.appointment.model_name}</span>
            </div>
          )}
        </div>

        {/* Tooltip détaillé au survol */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/slot:block z-50 bg-gray-900 text-white text-xs rounded p-3 shadow-lg max-w-xs whitespace-pre-line pointer-events-none">
          {tooltipContent}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  };

  // Composant pour la grille horaire
  const HourGrid = () => (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-t border-border/30"
          style={{ top: i * HOUR_HEIGHT }}
        />
      ))}
    </div>
  );

  // Format d'affichage de la date courante
  const getCurrentDateTitle = () => {
    switch (view) {
      case 'day':
        return currentDate.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'week':
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
      case 'month':
        return currentDate.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
        });
      default:
        return '';
    }
  };

  // Le calendrier s'affiche toujours, même vide

      return (
    <div className="flex h-full">
      {/* Contenu principal du calendrier */}
      <div 
        className={`transition-all duration-300 space-y-4 ${
          sidebarOpen ? 'w-3/5 pr-4' : 'w-full'
        }`}
      >
        {/* Header avec navigation et sélecteur de vue */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Aujourd'hui
            </Button>
            
            <Select value={view} onValueChange={(value: CalendarView) => setView(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Jour</SelectItem>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold min-w-[200px] text-center">
              {getCurrentDateTitle()}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-2"
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
        </div>

      {/* Vue jour */}
      {view === 'day' && (
        <div className="border rounded-lg">
          <div className="grid grid-cols-1">
            <div className="border-b p-2 bg-muted/50 text-center font-medium">
              {currentDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
            <div 
              className="relative"
              onContextMenu={(e) => handleContextMenu(e, currentDate, e.currentTarget as HTMLElement)}
              style={{ height: TOTAL_HOURS * HOUR_HEIGHT + 40 }}
            >
              {/* En-tête avec les heures */}
              <div className="grid grid-cols-5 border-b">
                <div className="p-2 bg-muted/30 text-xs font-medium text-center">
                  Heure
                </div>
                <div className="col-span-4 p-2 bg-muted/30 text-xs font-medium text-center">
                  Créneaux
                </div>
              </div>
              
              {/* Grille principale */}
              <div className="grid grid-cols-5 relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
                {/* Colonne des heures */}
                <div className="border-r bg-muted/30 text-xs relative">
                  {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                    <div 
                      key={i} 
                      className="absolute left-0 right-0 px-2 text-muted-foreground text-xs flex items-center"
                      style={{ 
                        top: i * HOUR_HEIGHT, 
                        height: HOUR_HEIGHT,
                      }}
                    >
                      <span className="bg-muted/30 px-1 rounded">
                        {String(START_HOUR + i).padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Zone des créneaux */}
                <div className="col-span-4 relative">
                  <HourGrid />
                  
                  {getSlotsForDate(currentDate).map((slot) => {
                    const { top, height } = calculateSlotPosition(slot);
                    const isAppointment = !!slot.appointment;
                    
                    // Légèrement décaler les rendez-vous vers la droite pour laisser voir les disponibilités
                    const leftOffset = isAppointment ? 4 : 1;
                    const rightOffset = isAppointment ? 1 : 4;
                    
                    return (
                      <PositionedSlotCard 
                        key={slot.id}
                        slot={slot} 
                        style={{ 
                          top, 
                          height, 
                          left: `${leftOffset}px`, 
                          right: `${rightOffset}px` 
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue semaine */}
      {view === 'week' && (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-8">
            <div className="border-b p-2 bg-muted/50"></div>
            {getWeekDays().map((day, index) => (
              <div key={index} className="border-b border-l p-2 bg-muted/50 text-center">
                <div className="font-medium text-sm">
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
          
          <div className="grid grid-cols-8" style={{ minHeight: TOTAL_HOURS * HOUR_HEIGHT + 40 }}>
            <div className="border-r bg-muted/30 text-xs relative">
              <div className="sticky top-0 bg-muted/30 py-2 px-2 border-b text-center text-xs font-medium">
                Heure
              </div>
              <div className="relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
                {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                  <div 
                    key={i} 
                    className="absolute left-0 right-0 px-2 text-muted-foreground text-xs flex items-center"
                    style={{ 
                      top: i * HOUR_HEIGHT, 
                      height: HOUR_HEIGHT,
                    }}
                  >
                    <span className="bg-muted/30 px-1 rounded">
                      {String(START_HOUR + i).padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {getWeekDays().map((day, index) => {
              const daySlots = getSlotsForDate(day);
              
              return (
                <div 
                  key={index} 
                  className="border-l relative"
                  onContextMenu={(e) => handleContextMenu(e, day, e.currentTarget as HTMLElement)}
                  style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
                >
                  {/* Grille horaire */}
                  <HourGrid />
                  
                  {/* Créneaux positionnés */}
                  {daySlots.map((slot, index) => {
                    const { top, height } = calculateSlotPosition(slot);
                    const isAppointment = !!slot.appointment;
                    
                    // Légèrement décaler les rendez-vous vers la droite pour laisser voir les disponibilités
                    const leftOffset = isAppointment ? 4 : 1;
                    const rightOffset = isAppointment ? 1 : 4;
                    
                    return (
                      <PositionedSlotCard 
                        key={slot.id}
                        slot={slot} 
                        style={{ 
                          top, 
                          height, 
                          left: `${leftOffset}px`, 
                          right: `${rightOffset}px` 
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vue mois */}
      {view === 'month' && (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="border-b p-2 bg-muted/50 text-center font-medium text-sm">
                {day}
              </div>
            ))}
          </div>
          
          {getMonthCalendar().map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((day, dayIndex) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                const daySlots = getSlotsForDate(day);
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`border-l border-b min-h-[120px] p-1 ${
                      !isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
                    }`}
                    onContextMenu={(e) => handleContextMenu(e, day)}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-blue-600 font-bold' : ''
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {daySlots.slice(0, 3).map((slot) => {
                        const isAppointment = !!slot.appointment;
                        return (
                          <div 
                            key={slot.id} 
                            className={`text-xs p-1 rounded cursor-pointer border ${
                              isAppointment 
                                ? 'bg-purple-200 border-purple-300 text-purple-900 shadow-sm' 
                                : 'bg-green-100 border-green-300 text-green-900 dark:bg-green-900 dark:text-green-100'
                            }`}
                            onClick={() => openViewModal(slot)}
                            onContextMenu={(e) => handleSlotContextMenu(e, slot)}
                          >
                            <div className="font-medium truncate flex items-center">
                              <span className="mr-1">{isAppointment ? '📅' : '🕐'}</span>
                              {slot.title || (isAppointment ? 'RDV' : 'Dispo')}
                            </div>
                            <div className={`text-xs ${isAppointment ? 'opacity-90' : 'opacity-75'}`}>
                              {new Date(slot.start_datetime).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            {isAppointment && slot.appointment && (
                              <div className="text-xs opacity-90 truncate bg-white/20 px-1 rounded mt-0.5">
                                {slot.appointment.model_name}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {daySlots.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{daySlots.length - 3} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Menu contextuel */}
      <ContextMenuPopover
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        position={contextMenu.position}
        onCreateAvailability={() => openEventModal('availability')}
        onCreateAppointment={() => openEventModal('appointment')}
      />

      {/* Menu contextuel des créneaux */}
      <SlotContextMenu
        isOpen={slotContextMenu.isOpen}
        onClose={() => setSlotContextMenu(prev => ({ ...prev, isOpen: false }))}
        position={slotContextMenu.position}
        onEdit={() => slotContextMenu.slot && openEditModal(slotContextMenu.slot)}
        onDelete={() => slotContextMenu.slot && handleDeleteSlotFromContext(slotContextMenu.slot)}
        onConvert={() => slotContextMenu.slot && handleConvertToModel(slotContextMenu.slot)}
        hasAppointment={!!slotContextMenu.slot?.appointment}
      />

      {/* Modale de création/édition d'événement */}
      <CreateEventModal
        isOpen={eventModal.isOpen}
        onClose={closeEventModal}
        onEventCreated={() => {
          closeEventModal();
          onSlotsChange();
        }}
        eventType={eventModal.eventType}
        prefilledData={eventModal.prefilledData}
        editingSlot={eventModal.editingSlot}
        viewOnly={eventModal.viewOnly}
      />

      {/* Modal de conversion en mannequin */}
      <ConvertAppointmentModal
        isOpen={convertModelModal.isOpen}
        onClose={handleCloseConvertModal}
        onSuccess={handleModelConverted}
        appointmentData={convertModelModal.appointmentData}
      />
      </div>

      {/* Sidebar coulissant pour les rendez-vous à venir */}
      <div 
        className={`transition-all duration-300 border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
          sidebarOpen ? 'w-2/5 opacity-100' : 'w-0 opacity-0 overflow-hidden'
        }`}
      >
        {sidebarOpen && (
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Prochains rendez-vous</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="text-center text-muted-foreground py-8">
                  Chargement...
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((slot) => (
                    <div key={slot.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        {slot.appointment && (
                          <p className="text-sm font-medium text-violet-400/80 mb-1">
                            avec {slot.appointment.model_name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(slot.start_datetime).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(slot.start_datetime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} - {new Date(slot.end_datetime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center justify-end mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Confirmé
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  Aucun rendez-vous à venir.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 