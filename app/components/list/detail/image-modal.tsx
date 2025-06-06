"use client"

import { useEffect, useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ImageModalProps {
  images: string[]
  selectedIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: (e: React.MouseEvent) => void
  onPrev: (e: React.MouseEvent) => void
}

export function ImageModal({
  images,
  selectedIndex,
  isOpen,
  onClose,
  onNext,
  onPrev
}: ImageModalProps) {
  // Gestion des raccourcis clavier pour navigation et fermeture
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowRight") {
        onNext(e as unknown as React.MouseEvent)
      } else if (e.key === "ArrowLeft") {
        onPrev(e as unknown as React.MouseEvent)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose, onNext, onPrev])

  if (!isOpen || !images || images.length === 0 || selectedIndex < 0) {
    return null
  }

  const selectedImage = images[selectedIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      {/* Bouton de fermeture */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <X size={32} />
      </button>

      {/* Image */}
      <div className="relative max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full">
          <img
            src={selectedImage}
            alt={`Photo ${selectedIndex + 1}`}
            className="object-contain w-full h-full"
          />
        </div>
      </div>

      {/* Boutons de navigation */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            onClick={onPrev}
            className="absolute left-4 text-white hover:text-gray-300 hover:bg-black/20 rounded-full p-2"
          >
            <ChevronLeft size={32} />
          </Button>
          <Button
            variant="ghost"
            onClick={onNext}
            className="absolute right-4 text-white hover:text-gray-300 hover:bg-black/20 rounded-full p-2"
          >
            <ChevronRight size={32} />
          </Button>
        </>
      )}

      {/* Indicateur de position */}
      <div className="absolute bottom-4 text-white">
        {selectedIndex + 1} / {images.length}
      </div>
    </div>
  )
}