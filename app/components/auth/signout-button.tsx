"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  label?: string;
}

export function SignOutButton({ 
  variant = "default", 
  size = "default", 
  showIcon = true, 
  label = "Déconnexion" 
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      
      // Appeler la route d'API pour se déconnecter
      const response = await fetch("/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la déconnexion");
      }
      
      // Forcer un rechargement complet de la page pour résoudre les problèmes de cookies
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {isLoading ? "Déconnexion..." : label}
    </Button>
  );
} 