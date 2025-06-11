"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { UserIcon, LogOut, Settings, User, FolderKanban, Home, LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { AccountSettingsModal } from "./settings/account-settings-modal";

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"account" | "settings">("account");

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
  };

  const handleOpenAccount = () => {
    setModalTab("account");
    setIsModalOpen(true);
  };

  const handleOpenSettings = () => {
    setModalTab("settings");
    setIsModalOpen(true);
  };

  // Obtenir les initiales de l'utilisateur pour l'avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };
  
  // Vérifier si l'utilisateur est admin ou agent
  const isAdminOrAgent = profile && ['admin', 'agent'].includes(profile.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full"
          aria-label="Menu utilisateur"
        >
          <Avatar>
            {user && profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name || user.email || ""} />
            ) : null}
            <AvatarFallback>{user ? getInitials() : <UserIcon className="h-5 w-5" />}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" forceMount>
        {user ? (
          <>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{profile?.full_name || "Utilisateur"}</p>
                  {profile?.role && (
                    <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {profile.role}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Liens de navigation */}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Accueil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/projects" className="flex items-center cursor-pointer">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  <span>Projets</span>
                </Link>
              </DropdownMenuItem>
              {isAdminOrAgent && (
                <DropdownMenuItem asChild>
                  <Link href="/agenda" className="flex items-center cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Agenda</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            {/* Liens de compte */}
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleOpenAccount} className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Mon compte</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenSettings} className="flex items-center cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            {/* Déconnexion */}
            <DropdownMenuItem
              className="text-red-500 cursor-pointer"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isLoading ? "Déconnexion..." : "Se déconnecter"}</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Bienvenue</p>
                <p className="text-xs leading-none text-muted-foreground">Connectez-vous pour accéder à toutes les fonctionnalités</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Options de connexion et inscription */}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/login" className="flex items-center cursor-pointer">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Connexion</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/register" className="flex items-center cursor-pointer">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Inscription</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
      
      {/* Modal Account/Settings */}
      <AccountSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab={modalTab}
      />
    </DropdownMenu>
  );
} 