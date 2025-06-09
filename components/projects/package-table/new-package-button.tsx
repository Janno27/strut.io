"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NewPackageButtonProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function NewPackageButton({ isOpen, setIsOpen }: NewPackageButtonProps) {
  return (
    <Button 
      size="sm" 
      className="flex items-center gap-2"
      onClick={() => setIsOpen(true)}
    >
      <Plus className="h-4 w-4" />
      <span>Nouveau package</span>
    </Button>
  );
} 