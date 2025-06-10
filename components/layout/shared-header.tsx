"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SharedUserMenu } from "./shared-user-menu"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface SharedHeaderProps {
  onOpenWishlist?: () => void
  wishlistCount?: number
}

export function SharedHeader({ onOpenWishlist, wishlistCount = 0 }: SharedHeaderProps = {}) {
  return (
    <div className="w-full flex items-center justify-between px-4 pb-2">
      <div>
        <SharedUserMenu />
      </div>
      
      <div className="text-center">
        <h1 className="text-4xl font-bold">Strut.io</h1>
        <p className="text-base text-muted-foreground mt-1">
          Simplifiez la gestion, sublimez vos talents.
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        {onOpenWishlist && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onOpenWishlist}
            className="rounded-full relative"
            title="Ouvrir la wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Button>
        )}
        <ThemeToggle />
      </div>
    </div>
  )
} 