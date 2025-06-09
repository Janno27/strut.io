"use client";

import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Client {
  id: string;
  name: string;
}

interface ClientSelectorProps {
  clients: Client[];
  selectedClient: Client | null;
  setSelectedClient: (client: Client) => void;
  onNewClient: () => void;
}

export function ClientSelector({
  clients,
  selectedClient,
  setSelectedClient,
  onNewClient
}: ClientSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
          <span>{selectedClient?.name || 'Tous les clients'}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem 
            key="all"
            onClick={() => setSelectedClient({ id: 'all', name: 'Tous les clients' })}
            className="cursor-pointer"
          >
            Tous les clients
          </DropdownMenuItem>
          {clients.map(client => (
            <DropdownMenuItem 
              key={client.id} 
              onClick={() => setSelectedClient(client)}
              className="cursor-pointer"
            >
              {client.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={onNewClient}
            className="cursor-pointer text-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau client
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 