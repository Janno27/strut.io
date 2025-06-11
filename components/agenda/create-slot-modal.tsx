"use client";

import { useState } from 'react';
import { useAgenda } from '@/hooks/use-agenda';
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
import { useToast } from '@/components/ui/use-toast';

interface CreateSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSlotCreated: () => void;
}

export function CreateSlotModal({ isOpen, onClose, onSlotCreated }: CreateSlotModalProps) {
  const { createSlot, loading } = useAgenda();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
  });

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
        description: "Vous ne pouvez pas créer un créneau dans le passé.",
        variant: "destructive",
      });
      return;
    }

    const result = await createSlot({
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
      title: formData.title || undefined,
      description: formData.description || undefined,
    });

    if (result) {
      toast({
        title: "Succès",
        description: "Le créneau a été créé avec succès.",
      });
      setFormData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
      });
      onSlotCreated();
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du créneau.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouveau créneau de disponibilité</DialogTitle>
          <DialogDescription>
            Créez un nouveau créneau pour que les mannequins puissent prendre rendez-vous.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre (optionnel)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="ex: Séance photo casting"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Détails du rendez-vous..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Heure de début *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Heure de fin *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le créneau'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 