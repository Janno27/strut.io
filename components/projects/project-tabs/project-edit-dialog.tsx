"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ProjectFormData {
  id: string;
  name: string;
  description: string;
  clientId: string;
}

interface Client {
  id: string;
  name: string;
}

interface ProjectEditDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  project: ProjectFormData;
  setProject: (data: ProjectFormData) => void;
  clients: Client[];
  onUpdateProject: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  onDeleteProject: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}

export function ProjectEditDialog({
  isOpen,
  setIsOpen,
  project,
  setProject,
  clients,
  onUpdateProject,
  onDeleteProject
}: ProjectEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le projet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-client">Client</Label>
            <select 
              id="edit-client"
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              value={project.clientId}
              onChange={(e) => setProject({ ...project, clientId: e.target.value })}
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Nom du projet</Label>
            <Input 
              id="edit-name" 
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea 
              id="edit-description" 
              rows={3}
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <Button variant="destructive" onClick={onDeleteProject}>
            Supprimer
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={onUpdateProject}>
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 