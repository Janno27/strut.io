"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageModalProps } from "./types"

export function ImageModal({ imageUrl, modelName, onClose }: ImageModalProps) {
  if (!imageUrl) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl h-auto max-h-[90vh]">
        <Image
          src={imageUrl}
          alt={modelName}
          fill
          className="object-contain"
          sizes="90vw"
        />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Fermer</span>
        </Button>
      </div>
    </div>
  )
}