import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, RotateCcw } from "lucide-react"
import { FocalPoint } from "../types"

interface ImagePositionEditorProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  currentFocalPoint?: FocalPoint
  onPositionComplete: (focalPoint: FocalPoint) => void
  title?: string
}

export function ImagePositionEditor({
  isOpen,
  onClose,
  imageUrl,
  currentFocalPoint,
  onPositionComplete,
  title = "Repositionner l'image"
}: ImagePositionEditorProps) {
  const [focalPoint, setFocalPoint] = useState<FocalPoint>(
    currentFocalPoint || { x: 50, y: 50 }
  )
  const containerRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setFocalPoint({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    })
  }

  const handleReset = () => {
    setFocalPoint({ x: 50, y: 50 })
  }

  const handleSave = () => {
    onPositionComplete(focalPoint)
    onClose()
  }

  const objectPosition = `${focalPoint.x}% ${focalPoint.y}%`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Cliquez sur l'image pour repositionner le point focal dans la preview
          </p>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Zone de preview et d'édition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image originale pour sélection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliquez pour repositionner :</label>
              <div 
                ref={containerRef}
                className="relative aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden cursor-crosshair"
                onClick={handleContainerClick}
              >
                <Image
                  src={imageUrl}
                  alt="Image à repositionner"
                  fill
                  className="object-contain"
                  sizes="300px"
                />
                {/* Point focal indicateur */}
                <div 
                  className="absolute w-3 h-3 bg-red-500 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${focalPoint.x}%`,
                    top: `${focalPoint.y}%`
                  }}
                />
                {/* Crosshair */}
                <div 
                  className="absolute w-full h-0.5 bg-red-500/30 pointer-events-none"
                  style={{ top: `${focalPoint.y}%` }}
                />
                <div 
                  className="absolute h-full w-0.5 bg-red-500/30 pointer-events-none"
                  style={{ left: `${focalPoint.x}%` }}
                />
              </div>
            </div>
            
            {/* Preview du résultat */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aperçu dans la grille :</label>
              <div className="relative aspect-square border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Aperçu repositionné"
                  fill
                  className="object-cover"
                  style={{ objectPosition }}
                  sizes="300px"
                />
              </div>
            </div>
          </div>

          {/* Coordonnées et contrôles */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Position:</span>{" "}
              <span className="font-mono">
                X: {focalPoint.x.toFixed(1)}%, Y: {focalPoint.y.toFixed(1)}%
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Centrer
            </Button>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Appliquer
          </Button>
        </div>
      </div>
    </div>
  )
} 