"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SearchBar } from "@/components/ui/search-bar"
import { UserMenu } from "@/components/auth/user-menu"
import { Link } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"

interface HeaderProps {
  onSearch?: (query: string) => void
  showSearch?: boolean
}

export function Header({ onSearch, showSearch = false }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { user, profile } = useAuth()
  const { toast } = useToast()

  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query)
    }
  }

  const handleToggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const handleShareAgenda = async () => {
    if (!user) return
    
    const shareUrl = `${window.location.origin}/shared/agenda/${user.id}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Lien copié !",
        description: "Le lien de partage de votre agenda a été copié dans le presse-papiers.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  // Vérifier si on est sur la page agenda pour afficher le bouton partage
  const isAgendaPage = typeof window !== 'undefined' && window.location.pathname === '/agenda'
  const showShareButton = isAgendaPage && profile?.role === 'agent'
  
  return (
    <div className="w-full flex items-center justify-between px-4 pb-2">
      <div>
        <UserMenu />
      </div>
      
      <div className="text-center">
                  <h1 className="text-4xl font-bold">Casting.io</h1>
        <p className="text-base text-muted-foreground mt-1">
        Simplifiez la gestion, sublimez vos talents.
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        {showSearch && (
          <SearchBar 
            isOpen={isSearchOpen}
            onToggle={handleToggleSearch}
            onSearch={handleSearch}
          />
        )}
        {showShareButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShareAgenda}
            title="Partager votre agenda"
          >
            <Link className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        )}
        <ThemeToggle />
      </div>
    </div>
  )
} 