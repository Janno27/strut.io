"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NewProjectButtonProps {
  onClick: () => void;
}

export function NewProjectButton({ onClick }: NewProjectButtonProps) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="mr-2"
      onClick={onClick}
    >
      <Plus className="h-4 w-4" />
    </Button>
  );
} 