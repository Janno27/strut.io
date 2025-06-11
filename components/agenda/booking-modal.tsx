"use client";

import { useState } from 'react';
import { useAgenda } from '@/hooks/use-agenda';
import { AgentSlot } from '@/lib/types/agenda';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: AgentSlot & { agent_id?: string };
  onBookingSuccess: () => void;
}

export function BookingModal({ isOpen, onClose, slot, onBookingSuccess }: BookingModalProps) {
  const { createAppointment, loading } = useAgenda();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    model_name: '',
    model_email: '',
    model_phone: '',
    model_instagram: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.model_name.trim()) {
      alert('Veuillez entrer votre nom.');
      return;
    }

    const result = await createAppointment({
      slot_id: slot.id,
      start_datetime: slot.start_datetime,
      end_datetime: slot.end_datetime,
      model_name: formData.model_name.trim(),
      model_email: formData.model_email.trim() || undefined,
      model_phone: formData.model_phone.trim() || undefined,
      model_instagram: formData.model_instagram.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    });

    if (result) {
      // Sauvegarder le rendez-vous dans localStorage pour cet agent (gestion de plusieurs RDV)
      const agentId = slot.agent_id;
      if (agentId) {
        const storageKey = `appointments_${agentId}`;
        const appointmentToStore = {
          ...result,
          start_datetime: slot.start_datetime,
          end_datetime: slot.end_datetime,
        };
        
        // Récupérer les rendez-vous existants
        const existingAppointments = localStorage.getItem(storageKey);
        let appointmentsList = [];
        
        if (existingAppointments) {
          try {
            appointmentsList = JSON.parse(existingAppointments);
          } catch (error) {
            console.error('Erreur lors de la lecture des rendez-vous existants:', error);
            appointmentsList = [];
          }
        }
        
        // Ajouter le nouveau rendez-vous
        appointmentsList.push(appointmentToStore);
        
        // Sauvegarder la liste mise à jour
        localStorage.setItem(storageKey, JSON.stringify(appointmentsList));
      }
      
      setIsSuccess(true);
    } else {
      alert('Une erreur est survenue lors de la réservation. Veuillez réessayer.');
    }
  };

  const handleClose = () => {
    if (isSuccess) {
      onBookingSuccess();
    } else {
      onClose();
    }
    setFormData({
      model_name: '',
      model_email: '',
      model_phone: '',
      model_instagram: '',
      notes: '',
    });
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="text-center space-y-4 py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Réservation confirmée !
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Votre rendez-vous a été confirmé avec succès. L'agent vous contactera prochainement.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(slot.start_datetime).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mt-1">
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
            </div>
            <Button onClick={handleClose} className="w-full">
              Continuer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Réserver ce créneau</DialogTitle>
          <DialogDescription>
            Remplissez vos informations pour réserver ce rendez-vous.
          </DialogDescription>
        </DialogHeader>
        
        {/* Détails du créneau */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-blue-900 dark:text-blue-100">
            {slot.title || 'Créneau disponible'}
          </h4>
          {slot.description && (
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {slot.description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-sm text-blue-600 dark:text-blue-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(slot.start_datetime).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center space-x-1">
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
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model_name">Nom complet du mannequin *</Label>
            <Input
              id="model_name"
              value={formData.model_name}
              onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
              placeholder="Votre nom complet"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model_email">Email (optionnel)</Label>
            <Input
              id="model_email"
              type="email"
              value={formData.model_email}
              onChange={(e) => setFormData(prev => ({ ...prev, model_email: e.target.value }))}
              placeholder="votre.email@exemple.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model_phone">Téléphone (optionnel)</Label>
            <Input
              id="model_phone"
              type="tel"
              value={formData.model_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, model_phone: e.target.value }))}
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model_instagram">Instagram (optionnel)</Label>
            <Input
              id="model_instagram"
              value={formData.model_instagram}
              onChange={(e) => setFormData(prev => ({ ...prev, model_instagram: e.target.value }))}
              placeholder="@votre_username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informations complémentaires, questions, etc."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Réservation...' : 'Confirmer la réservation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 