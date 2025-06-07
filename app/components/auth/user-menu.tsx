"use client";

import { useAuth } from "@/app/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRole } from "@/app/lib/supabase/types";

export function UserMenu() {
  const { user, profile, signOut, isLoading } = useAuth();
  const router = useRouter();
  
  // Si le chargement est en cours, afficher un placeholder
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher les boutons de connexion
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/login">Connexion</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Inscription</Link>
        </Button>
      </div>
    );
  }

  // Récupérer les initiales pour l'avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || "U";
  };

  // Construire le menu utilisateur
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full flex items-center justify-center"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={profile?.avatar_url || ""}
              alt={profile?.full_name || user.email || "Avatar"}
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.full_name || "Utilisateur"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Ajouter des liens en fonction du rôle de l'utilisateur */}
        {profile?.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin">Tableau de bord admin</Link>
          </DropdownMenuItem>
        )}
        
        {profile?.role === "agent" && (
          <DropdownMenuItem asChild>
            <Link href="/agent">Tableau de bord agent</Link>
          </DropdownMenuItem>
        )}
        
        {profile?.role === "model" && (
          <DropdownMenuItem asChild>
            <Link href="/profile">Mon profil</Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem asChild>
          <Link href="/settings">Paramètres</Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async () => {
            await signOut();
            // Forcer un rechargement complet de la page pour résoudre les problèmes de cookies
            window.location.href = "/";
          }}
        >
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 