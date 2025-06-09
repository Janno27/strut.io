"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { createClient } from "@/lib/supabase/client";

interface PackageFormData {
  name: string;
  description: string;
  status: string;
}

interface Model {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  height: number;
  bust: number;
  waist: number;
  hips: number;
}

interface PackageDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newPackage: PackageFormData;
  setNewPackage: (data: PackageFormData) => void;
  models: Model[];
  selectedModels: string[];
  onModelSelection: (modelId: string) => void;
  onCreatePackage: () => Promise<void>;
  isEditing?: boolean;
}

export function PackageDialog({
  isOpen,
  setIsOpen,
  newPackage,
  setNewPackage,
  models,
  selectedModels,
  onModelSelection,
  onCreatePackage,
  isEditing = false
}: PackageDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le package" : "Créer un nouveau package"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom du package</Label>
            <Input 
              id="name" 
              placeholder="Ex: Package Standard" 
              value={newPackage.name}
              onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Description du package"
              rows={2}
              value={newPackage.description}
              onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Statut</Label>
            <select 
              id="status"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              value={newPackage.status}
              onChange={(e) => setNewPackage({ ...newPackage, status: e.target.value })}
            >
              <option value="pending">En attente</option>
              <option value="planned">Planifié</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          
          <div className="grid gap-2 mt-2">
            <Label>Sélectionner les mannequins</Label>
            <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
              {models.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun mannequin disponible</p>
              ) : (
                <div className="space-y-2">
                  {models.map(model => (
                    <div key={model.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`model-${model.id}`} 
                        checked={selectedModels.includes(model.id)}
                        onCheckedChange={() => onModelSelection(model.id)}
                      />
                      <Label 
                        htmlFor={`model-${model.id}`}
                        className="flex-1 text-sm cursor-pointer"
                      >
                        {model.first_name} {model.last_name} 
                        <span className="text-xs text-muted-foreground ml-2">
                          ({model.gender === 'male' ? 'H' : 'F'}, {model.height}cm, {model.bust}-{model.waist}-{model.hips})
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={onCreatePackage}>
            {isEditing ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 