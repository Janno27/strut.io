"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ClientFormData {
  name: string;
  contact: string;
  email: string;
  phone: string;
}

interface ClientDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newClient: ClientFormData;
  setNewClient: (data: ClientFormData) => void;
  onCreateClient: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}

export function ClientDialog({
  isOpen,
  setIsOpen,
  newClient,
  setNewClient,
  onCreateClient
}: ClientDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau client</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client-name">Nom du client</Label>
            <Input 
              id="client-name" 
              placeholder="Ex: Marque de luxe"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client-contact">Nom du contact</Label>
            <Input 
              id="client-contact" 
              placeholder="Ex: Jean Dupont"
              value={newClient.contact}
              onChange={(e) => setNewClient({ ...newClient, contact: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="client-email">Email</Label>
              <Input 
                id="client-email" 
                type="email" 
                placeholder="Ex: contact@marque.com"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-phone">Téléphone</Label>
              <Input 
                id="client-phone" 
                placeholder="Ex: 01 23 45 67 89"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={onCreateClient}>
            Créer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}