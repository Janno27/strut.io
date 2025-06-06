"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface Model {
  id: string
  name: string
  age: number
  height: number
  bust: number
  waist: number
  hips: number
  imageUrl: string
  additionalImages?: string[]
  description?: string
  instagram?: string
  experience?: string[]
}

interface WishlistDrawerProps {
  isOpen: boolean
  onClose: () => void
  favorites: Model[]
  onRemoveFavorite: (id: string) => void
  onSelectModel: (id: string) => void
}

export function WishlistDrawer({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectModel
}: WishlistDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[350px] sm:w-[450px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center justify-between">
            <span>Wishlist</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground mb-2">Votre wishlist est vide</p>
            <p className="text-sm text-muted-foreground">Cliquez sur le cœur pour ajouter des mannequins à votre wishlist</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {favorites.map((model) => (
              <div 
                key={model.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => {
                  onSelectModel(model.id);
                  onClose();
                }}
              >
                <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={model.imageUrl}
                    alt={model.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium">{model.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {model.age} • {model.height} • {model.bust}/{model.waist}/{model.hips}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(model.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 