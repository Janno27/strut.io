"use client"

import { Button } from "@/components/ui/button"
import { Upload, X, Edit, Camera, Move } from "lucide-react"
import Image from "next/image"

interface FocalPoint {
  x: number
  y: number
}

interface MainImageUploaderProps {
  image: string | null
  focalPoint?: FocalPoint
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove: () => void
  onImageEdit?: () => void
  onImageReposition?: () => void
  className?: string
  height?: string
}

export function MainImageUploader({
  image,
  focalPoint,
  onImageUpload,
  onImageRemove,
  onImageEdit,
  onImageReposition,
  className = "",
  height = "h-80"
}: MainImageUploaderProps) {
  return (
    <div className={`border-2 border-dashed rounded-lg p-2 ${height} flex flex-col items-center justify-center relative group ${className}`}>
      {image ? (
        <div className="relative w-full h-full">
          <Image
            src={image}
            alt="Photo principale"
            fill
            className="object-cover rounded-lg"
            style={focalPoint ? { objectPosition: `${focalPoint.x}% ${focalPoint.y}%` } : undefined}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          
          {/* Overlay avec les contrôles */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
            <div className="flex gap-2">
              {/* Bouton repositionner */}
              {onImageReposition && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onImageReposition}
                  title="Repositionner l'image"
                >
                  <Move className="h-4 w-4" />
                </Button>
              )}
              
              {/* Bouton modifier */}
              {onImageEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onImageEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              
              {/* Bouton remplacer */}
              <div className="relative">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  title="Remplacer l'image"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={onImageUpload}
                />
              </div>
              
              {/* Bouton supprimer */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={onImageRemove}
                title="Supprimer l'image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Badge "Photo principale" */}
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
            Principale
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-10 w-10 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">Photo principale</p>
            <p className="text-xs text-muted-foreground">Cliquez pour télécharger</p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={onImageUpload}
          />
        </>
      )}
    </div>
  )
} 