"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProjectFormData {
  name: string;
  description: string;
  clientId: string;
}

interface Client {
  id: string;
  name: string;
}

interface ProjectDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newProject: ProjectFormData;
  setNewProject: (data: ProjectFormData) => void;
  clients: Client[];
  onCreateProject: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  onNewClient: () => void;
}

export function ProjectDialog({
  isOpen,
  setIsOpen,
  newProject,
  setNewProject,
  clients,
  onCreateProject,
  onNewClient
}: ProjectDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Client</Label>
            <div className="flex gap-2">
              <select 
                id="client"
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                value={newProject.clientId}
                onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={onNewClient}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Nom du projet</Label>
            <Input 
              id="name" 
              placeholder="Ex: Campagne printemps 2024"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Description du projet"
              rows={3}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={onCreateProject}>
            Créer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 