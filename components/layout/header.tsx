"use client"

import { useState } from "react"
import { Link as LinkIcon, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserMenu } from "@/components/auth/user-menu"
import { useAuth } from "@/lib/auth/auth-provider"
import { toast } from "sonner"

export function Header() {
  const { profile } = useAuth()
  const [copied, setCopied] = useState(false)
  
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
        <UserMenu />
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