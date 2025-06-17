"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GripVertical, Plus, X, Move } from "lucide-react"
import Image from "next/image"

interface FocalPoint {
  x: number
  y: number
}

interface DraggableImageGridProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  onImageAdd: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove: (index: number) => void
  onImageReposition?: (index: number) => void
  allowMultiple?: boolean
  maxImages?: number
  className?: string
  focalPoints?: Record<string, FocalPoint>
  gridCols?: number
}

export function DraggableImageGrid({
  images,
  onImagesChange,
  onImageAdd,
  onImageRemove,
  onImageReposition,
  allowMultiple = true,
  maxImages = 10,
  className = "",
  focalPoints = {},
  gridCols = 3
}: DraggableImageGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    
    // Supprimer l'image de sa position originale
    newImages.splice(draggedIndex, 1)
    
    // Insérer l'image à la nouvelle position
    const finalDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newImages.splice(finalDropIndex, 0, draggedImage)
    
    onImagesChange(newImages)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }



  const gridClass = gridCols === 4 ? 'grid-cols-4' : 'grid-cols-3'
  
  return (
    <div className={`grid ${gridClass} gap-4 ${className}`}>
      {images.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className={`relative aspect-square border-2 rounded-lg overflow-hidden group cursor-move transition-all duration-200 ${
            dragOverIndex === index 
              ? "border-primary bg-primary/10 scale-105" 
              : draggedIndex === index
              ? "border-dashed border-muted-foreground opacity-50"
              : "border-border hover:border-primary/50"
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
        >
          <Image
            src={image}
            alt={`Photo ${index + 1}`}
            fill
            className="object-cover"
            style={{ 
              objectPosition: focalPoints[image] 
                ? `${focalPoints[image].x}% ${focalPoints[image].y}%` 
                : 'center' 
            }}
            sizes="(max-width: 768px) 50vw, 20vw"
          />
          
          {/* Overlay avec les contrôles */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex gap-2">
              {/* Bouton repositionner */}
              {onImageReposition && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onImageReposition(index)}
                  title="Repositionner l'image"
                >
                  <Move className="h-4 w-4" />
                </Button>
              )}
              
              {/* Bouton supprimer */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => onImageRemove(index)}
                title="Supprimer l'image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Indicateur de drag */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-white drop-shadow-lg" />
          </div>
          
          {/* Numéro d'ordre */}
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {index + 1}
          </div>
        </div>
      ))}
      
      {/* Bouton d'ajout */}
      {images.length < maxImages && (
        <div className="relative aspect-square border-2 border-dashed border-muted-foreground rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
          <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground text-center px-2">
            {allowMultiple ? "Ajouter plusieurs photos" : "Ajouter une photo"}
          </p>
          <input
            type="file"
            accept="image/*"
            multiple={allowMultiple}
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={onImageAdd}
          />
        </div>
      )}
    </div>
  )
} 