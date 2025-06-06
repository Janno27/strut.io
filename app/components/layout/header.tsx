"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { User, Settings, LogOut, LayoutDashboard, Link as LinkIcon, Copy, Check } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/app/components/ui/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/app/context/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function Header() {
  const { profile, signOut } = useAuth()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  
  // Gérer la déconnexion
  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }
  
  // Obtenir les initiales de l'utilisateur
  const getUserInitials = (): string => {
    if (!profile?.full_name) return "U"
    
    const nameParts = profile.full_name.split(" ")
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    
    return nameParts[0][0].toUpperCase()
  }
  
  // Vérifier si l'utilisateur est admin ou agent
  const isAdminOrAgent = profile && ['admin', 'agent'].includes(profile.role)
  
  // Générer le lien de partage pour les agents
  const generateShareLink = () => {
    if (profile?.role === 'agent') {
      const shareUrl = `${window.location.origin}/shared?agent=${profile.id}`
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Lien de partage copié dans le presse-papier")
      
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }
  
  return (
    <div className="w-full flex items-center justify-between px-4 pb-2">
      <div>
        {profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-10 w-10 cursor-pointer">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name || "Utilisateur"} />
                ) : (
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{profile.full_name || "Utilisateur"}</p>
                    <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {profile.role}
                    </span>
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Mon compte</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                {isAdminOrAgent && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Tableau de bord</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
      </div>
      
      <div className="text-center">
        <h1 className="text-4xl font-bold">Strut.io</h1>
        <p className="text-base text-muted-foreground mt-1">
        Simplifiez la gestion, sublimez vos talents.
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        {profile?.role === 'agent' && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={generateShareLink}
            className="rounded-full"
            title="Générer un lien de partage pour vos clients"
          >
            {copied ? (
              <Check className="h-5 w-5" />
            ) : (
              <LinkIcon className="h-5 w-5" />
            )}
          </Button>
        )}
        <ThemeToggle />
      </div>
    </div>
  )
} 