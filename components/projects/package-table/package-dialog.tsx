'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchBar } from '@/components/ui/search-bar';
import { Search } from 'lucide-react';

interface Model {
  id: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female';
  height: number;
  bust: number;
  waist: number;
  hips: number;
}

interface PackageFormData {
  name: string;
  description: string;
  status: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filtrer les mannequins en fonction de la recherche
  const filteredModels = models.filter(model => {
    const fullName = `${model.first_name} ${model.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || 
           model.first_name.toLowerCase().includes(query) || 
           model.last_name.toLowerCase().includes(query);
  });

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    // Si on ferme la recherche, on annule la recherche
    if (isSearchOpen) {
      setSearchQuery('');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    // Réinitialiser la recherche quand on ferme la dialog
    if (!open) {
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le package" : "Créer un nouveau package"}
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations pour {isEditing ? "modifier" : "créer"} le package.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du package</Label>
            <Input
              id="name"
              value={newPackage.name}
              onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newPackage.description}
              onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={newPackage.status}
              onValueChange={(value) => setNewPackage({ ...newPackage, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="planned">Planifié</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label>Sélectionner les mannequins</Label>
              {models.length > 0 && (
                <SearchBar 
                  isOpen={isSearchOpen}
                  onToggle={handleSearchToggle}
                  onSearch={handleSearch}
                  placeholder="Rechercher un mannequin..."
                />
              )}
            </div>
            <div className="max-h-[200px] overflow-y-auto border rounded-md p-3 space-y-2">
              {models.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun mannequin disponible
                </p>
              ) : filteredModels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun mannequin trouvé pour "{searchQuery}"
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredModels.map((model, index) => (
                    <div key={`model-checkbox-${model.id || index}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`model-${model.id || index}`}
                        checked={selectedModels.includes(model.id)}
                        onCheckedChange={() => onModelSelection(model.id)}
                      />
                      <Label htmlFor={`model-${model.id || index}`} className="text-sm font-normal">
                        {model.first_name} {model.last_name}
                        <span className="text-muted-foreground ml-1">
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={onCreatePackage}>
            {isEditing ? "Modifier" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
