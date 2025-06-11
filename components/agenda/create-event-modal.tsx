"use client";

import { useState, useEffect } from 'react';
import { useAgenda } from '@/hooks/use-agenda';
import { SlotWithAppointment } from '@/lib/types/agenda';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimeSelect } from '@/components/ui/time-select';
import { DateSelect } from '@/components/ui/date-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

type EventType = 'availability' | 'appointment';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
  eventType: EventType;
  prefilledData?: {
    date: string;
    startTime: string;
    endTime: string;
  };
  editingSlot?: SlotWithAppointment; // Pour l'édition
  viewOnly?: boolean; // Pour le mode lecture
}

export function CreateEventModal({ 
  isOpen, 
  onClose, 
  onEventCreated, 
  eventType,
  prefilledData,
  editingSlot,
  viewOnly = false
}: CreateEventModalProps) {
  const { createSlot, updateSlot, createAppointmentAsAgent, updateAppointment, loading } = useAgenda();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    modelName: '',
    modelEmail: '',
    modelPhone: '',
  });

  // Pré-remplir le formulaire quand prefilledData ou editingSlot change
  useEffect(() => {
    if (editingSlot && isOpen) {
      // Mode édition - pré-remplir avec les données du créneau existant
      const startDateTime = new Date(editingSlot.start_datetime);
      const endDateTime = new Date(editingSlot.end_datetime);
      
      setFormData({
        title: editingSlot.title || '',
        description: editingSlot.description || '',
        date: startDateTime.toISOString().split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5),
        endTime: endDateTime.toTimeString().slice(0, 5),
        modelName: editingSlot.appointment?.model_name || '',
        modelEmail: editingSlot.appointment?.model_email || '',
        modelPhone: editingSlot.appointment?.model_phone || '',
      });
    } else if (prefilledData && isOpen && !editingSlot) {
      // Mode création - pré-remplir avec les données du clic
      setFormData(prev => ({
        ...prev,
        date: prefilledData.date,
        startTime: prefilledData.startTime,
        endTime: prefilledData.endTime,
      }));
    }
  }, [prefilledData, editingSlot, isOpen]);

  // Calculer automatiquement l'heure de fin quand l'heure de début change
  const calculateEndTime = (startTime: string): string => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    // Ajouter 1 heure par défaut
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    // S'assurer que l'heure de fin ne dépasse pas 21h
    if (endDate.getHours() > 21) {
      endDate.setHours(21, 0, 0, 0);
    }
    
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleStartTimeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      startTime: value,
      endTime: prev.endTime || calculateEndTime(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    if (eventType === 'appointment' && !formData.modelName) {
      toast({
        title: "Erreur",
        description: "Veuillez renseigner le nom du mannequin.",
        variant: "destructive",
      });
      return;
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      toast({
        title: "Erreur",
        description: "L'heure de fin doit être après l'heure de début.",
        variant: "destructive",
      });
      return;
    }

    if (startDateTime < new Date()) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez pas créer un événement dans le passé.",
        variant: "destructive",
      });
      return;
    }

    let success = false;

    if (editingSlot) {
      // Mode édition
      if (eventType === 'availability') {
        success = await updateSlot(editingSlot.id, {
          start_datetime: startDateTime.toISOString(),
          end_datetime: endDateTime.toISOString(),
          title: formData.title || undefined,
          description: formData.description || undefined,
          is_available: true, // Disponibilité = créneau libre
        });
      } else {
        // Mettre à jour le slot et le rendez-vous
        const slotUpdateSuccess = await updateSlot(editingSlot.id, {
          start_datetime: startDateTime.toISOString(),
          end_datetime: endDateTime.toISOString(),
          title: formData.title || 'Rendez-vous',
          description: formData.description || undefined,
          is_available: false, // Rendez-vous = créneau occupé
        });

        if (slotUpdateSuccess && editingSlot.appointment) {
          success = await updateAppointment(editingSlot.appointment.id, {
            start_datetime: startDateTime.toISOString(),
            end_datetime: endDateTime.toISOString(),
            model_name: formData.modelName,
            model_email: formData.modelEmail || undefined,
            model_phone: formData.modelPhone || undefined,
          });
        } else {
          success = slotUpdateSuccess;
        }
      }
    } else {
      // Mode création
      if (eventType === 'availability') {
        const slot = await createSlot({
          start_datetime: startDateTime.toISOString(),
          end_datetime: endDateTime.toISOString(),
          title: formData.title || undefined,
          description: formData.description || undefined,
          is_available: true, // Disponibilité = créneau libre
        });
        success = slot !== null;
      } else {
        // Pour les rendez-vous créés par l'agent : créer slot + appointment en une fois
        const slot = await createSlot({
          start_datetime: startDateTime.toISOString(),
          end_datetime: endDateTime.toISOString(),
          title: formData.title || 'Rendez-vous',
          description: formData.description || undefined,
          is_available: false, // Le slot n'est plus disponible car occupé par un rendez-vous
        });

        if (slot) {
          const appointment = await createAppointmentAsAgent({
            slot_id: slot.id,
            start_datetime: startDateTime.toISOString(),
            end_datetime: endDateTime.toISOString(),
            model_name: formData.modelName,
            model_email: formData.modelEmail || undefined,
            model_phone: formData.modelPhone || undefined,
          });
          success = appointment !== null;
        }
      }
    }

    if (success) {
      toast({
        title: "Succès",
        description: editingSlot 
          ? `${eventType === 'availability' ? 'La disponibilité' : 'Le rendez-vous'} a été modifié${eventType === 'availability' ? 'e' : ''} avec succès.`
          : `${eventType === 'availability' ? 'La disponibilité' : 'Le rendez-vous'} a été créé${eventType === 'availability' ? 'e' : ''} avec succès.`,
      });
      resetForm();
      onEventCreated();
    } else {
      toast({
        title: "Erreur",
        description: editingSlot
          ? `Une erreur est survenue lors de la modification ${eventType === 'availability' ? 'de la disponibilité' : 'du rendez-vous'}.`
          : `Une erreur est survenue lors de la création ${eventType === 'availability' ? 'de la disponibilité' : 'du rendez-vous'}.`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      modelName: '',
      modelEmail: '',
      modelPhone: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getDialogTitle = () => {
    if (viewOnly) {
      return eventType === 'availability' 
        ? 'Détails de la disponibilité' 
        : 'Détails du rendez-vous';
    }
    if (editingSlot) {
      return eventType === 'availability' 
        ? 'Modifier la disponibilité' 
        : 'Modifier le rendez-vous';
    }
    return eventType === 'availability' 
      ? 'Nouvelle disponibilité' 
      : 'Nouveau rendez-vous';
  };

  const getDialogDescription = () => {
    if (viewOnly) {
      return eventType === 'availability'
        ? 'Consultez les détails de cette disponibilité.'
        : 'Consultez les détails de ce rendez-vous.';
    }
    if (editingSlot) {
      return eventType === 'availability'
        ? 'Modifiez les détails de cette disponibilité.'
        : 'Modifiez les détails de ce rendez-vous.';
    }
    return eventType === 'availability'
      ? 'Créez un nouveau créneau pour que les mannequins puissent prendre rendez-vous.'
      : 'Planifiez un rendez-vous directement avec un mannequin.';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={viewOnly ? (e) => e.preventDefault() : handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Titre {eventType === 'appointment' ? '*' : '(optionnel)'}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={viewOnly ? undefined : (e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={eventType === 'availability' ? "ex: Séance photo casting" : "ex: Rendez-vous casting"}
              required={eventType === 'appointment' && !viewOnly}
              readOnly={viewOnly}
              className={viewOnly ? "bg-muted/50" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={viewOnly ? undefined : (e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Détails..."
              rows={3}
              readOnly={viewOnly}
              className={viewOnly ? "bg-muted/50" : ""}
            />
          </div>

          {eventType === 'appointment' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="modelName">Nom du mannequin *</Label>
                <Input
                  id="modelName"
                  value={formData.modelName}
                  onChange={viewOnly ? undefined : (e) => setFormData(prev => ({ ...prev, modelName: e.target.value }))}
                  placeholder="Prénom et nom"
                  required={!viewOnly}
                  readOnly={viewOnly}
                  className={viewOnly ? "bg-muted/50" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelEmail">Email du mannequin (optionnel)</Label>
                <Input
                  id="modelEmail"
                  type="email"
                  value={formData.modelEmail}
                  onChange={viewOnly ? undefined : (e) => setFormData(prev => ({ ...prev, modelEmail: e.target.value }))}
                  placeholder="email@example.com"
                  readOnly={viewOnly}
                  className={viewOnly ? "bg-muted/50" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelPhone">Téléphone du mannequin (optionnel)</Label>
                <Input
                  id="modelPhone"
                  type="tel"
                  value={formData.modelPhone}
                  onChange={viewOnly ? undefined : (e) => setFormData(prev => ({ ...prev, modelPhone: e.target.value }))}
                  placeholder="+33 6 12 34 56 78"
                  readOnly={viewOnly}
                  className={viewOnly ? "bg-muted/50" : ""}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            {viewOnly ? (
              <Input
                id="date"
                value={new Date(formData.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                readOnly
                className="bg-muted/50"
              />
            ) : (
              <DateSelect
                id="date"
                value={formData.date}
                onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
                placeholder="Sélectionner une date"
                minDate={new Date().toISOString().split('T')[0]}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Heure de début *</Label>
              {viewOnly ? (
                <Input
                  id="startTime"
                  value={formData.startTime}
                  readOnly
                  className="bg-muted/50"
                />
              ) : (
                <TimeSelect
                  id="startTime"
                  value={formData.startTime}
                  onChange={handleStartTimeChange}
                  placeholder="Début"
                  startHour={8}
                  endHour={20}
                  minuteStep={15}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Heure de fin *</Label>
              {viewOnly ? (
                <Input
                  id="endTime"
                  value={formData.endTime}
                  readOnly
                  className="bg-muted/50"
                />
              ) : (
                <TimeSelect
                  id="endTime"
                  value={formData.endTime}
                  onChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
                  placeholder="Fin"
                  startHour={8}
                  endHour={21}
                  minuteStep={15}
                />
              )}
            </div>
          </div>

          <DialogFooter>
            {viewOnly ? (
              <Button type="button" onClick={handleClose}>
                Fermer
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading 
                    ? (editingSlot ? 'Modification...' : 'Création...') 
                    : editingSlot 
                      ? `Modifier ${eventType === 'availability' ? 'la disponibilité' : 'le rendez-vous'}`
                      : `Créer ${eventType === 'availability' ? 'la disponibilité' : 'le rendez-vous'}`
                  }
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 