"use client";

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar, Clock } from 'lucide-react';

interface ContextMenuPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onCreateAvailability: () => void;
  onCreateAppointment: () => void;
}

export function ContextMenuPopover({
  isOpen,
  onClose,
  position,
  onCreateAvailability,
  onCreateAppointment,
}: ContextMenuPopoverProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="bg-background border rounded-md shadow-md py-1 min-w-[150px]">
        <Button
          variant="ghost"
          className="w-full justify-start h-auto py-2 px-3 text-sm"
          onClick={() => {
            onCreateAvailability();
            onClose();
          }}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Disponibilité
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-auto py-2 px-3 text-sm"
          onClick={() => {
            onCreateAppointment();
            onClose();
          }}
        >
          <Clock className="mr-2 h-4 w-4" />
          Rendez-vous
        </Button>
      </div>
    </div>
  );
} 