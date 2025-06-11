"use client";

import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserPlus } from 'lucide-react';

interface SlotContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onEdit: () => void;
  onDelete: () => void;
  onConvert?: () => void;
  hasAppointment?: boolean;
}

export function SlotContextMenu({
  isOpen,
  onClose,
  position,
  onEdit,
  onDelete,
  onConvert,
  hasAppointment = false,
}: SlotContextMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
      }}
      data-slot-context-menu
    >
      <div className="bg-background border rounded-md shadow-md py-1 min-w-[140px]">
        {hasAppointment && onConvert && (
          <Button
            variant="ghost"
            className="w-full justify-start h-auto py-2 px-3 text-sm text-violet-600 hover:text-violet-700 hover:bg-violet-50"
            onClick={(e) => {
              e.stopPropagation(); // Empêche la propagation du clic
              onConvert();
              onClose();
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Convertir en mannequin
          </Button>
        )}
        
        <Button
          variant="ghost"
          className="w-full justify-start h-auto py-2 px-3 text-sm"
          onClick={() => {
            onEdit();
            onClose();
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start h-auto py-2 px-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </Button>
      </div>
    </div>
  );
} 