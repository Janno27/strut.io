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
      variant="ghost"
      size="sm" 
      className="text-muted-foreground hover:text-foreground flex items-center gap-1.5"
      onClick={() => setIsOpen(true)}
    >
      <Plus className="h-3.5 w-3.5" />
      <span className="text-sm">Nouveau package</span>
    </Button>
  );
} 