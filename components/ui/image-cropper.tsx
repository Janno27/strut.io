"use client"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { Crop, PixelCrop } from "react-image-crop"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import "react-image-crop/dist/ReactCrop.css"

interface ImageCropperProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  onCropComplete: (croppedImageFile: File) => void
  aspectRatio?: number
  title?: string
}

export function ImageCropper({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  aspectRatio = 1, // Format carré par défaut (1:1)
  title = "Recadrer l'image"
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    
    // Calculer le crop initial centré
    const cropSize = Math.min(width, height) * 0.8
    const x = (width - cropSize) / 2
    const y = (height - cropSize) / 2
    
    const initialCrop: Crop = {
      unit: 'px',
      x,
      y,
      width: cropSize,
      height: cropSize,
    }
    
    setCrop(initialCrop)
  }, [])

  // Fonction pour créer une image "propre" sans restriction CORS
  const createCleanImage = useCallback(async (imageUrl: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      // Si c'est une URL d'objet (blob:), on peut la traiter directement
      if (imageUrl.startsWith('blob:')) {
        fetch(imageUrl)
          .then(response => response.blob())
          .then(blob => {
            const cleanUrl = URL.createObjectURL(blob)
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              URL.revokeObjectURL(cleanUrl)
              resolve(img)
            }
            img.onerror = reject
            img.src = cleanUrl
          })
          .catch(reject)
      } else {
        // Pour les autres URLs, essayer avec crossOrigin
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = imageUrl
      }
    })
  }, [])

  const getCroppedImg = useCallback(
    async (imageUrl: string, crop: PixelCrop, sourceImage: HTMLImageElement): Promise<File> => {
      // Créer une image propre sans restrictions CORS
      const cleanImage = await createCleanImage(imageUrl)
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Impossible de créer le contexte canvas')
      }

      // Calculer les échelles basées sur l'image affichée et sa taille naturelle
      const scaleX = cleanImage.naturalWidth / sourceImage.width
      const scaleY = cleanImage.naturalHeight / sourceImage.height

      // Définir la taille du canvas (format carré)
      const outputSize = 400 // Taille de sortie en pixels
      canvas.width = outputSize
      canvas.height = outputSize

      // Calculer les coordonnées et dimensions réelles
      const cropX = crop.x * scaleX
      const cropY = crop.y * scaleY
      const cropWidth = crop.width * scaleX
      const cropHeight = crop.height * scaleY

      // Dessiner l'image recadrée
      ctx.drawImage(
        cleanImage,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputSize,
        outputSize
      )

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Erreur lors de la création du blob'))
            return
          }
          
          const file = new File([blob], 'cropped-image.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          
          resolve(file)
        }, 'image/jpeg', 0.95)
      })
    },
    [createCleanImage]
  )

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) {
      toast.error("Veuillez sélectionner une zone à recadrer")
      return
    }

    try {
      setIsProcessing(true)
      const croppedImageFile = await getCroppedImg(imageUrl, completedCrop, imgRef.current)
      onCropComplete(croppedImageFile)
      onClose()
      toast.success("Image recadrée avec succès")
    } catch (error) {
      console.error('Erreur lors du recadrage:', error)
      toast.error("Erreur lors du recadrage de l'image")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Sélectionnez la zone à conserver en faisant glisser les coins du cadre de sélection. L'image sera recadrée au format carré.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="max-w-full max-h-[500px] overflow-auto border rounded-lg">
            <ReactCrop
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              minWidth={50}
              minHeight={50}
              keepSelection
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Image à recadrer"
                onLoad={onImageLoad}
                className="max-w-none"
                style={{ maxWidth: '100%', maxHeight: '500px' }}
              />
            </ReactCrop>
          </div>
          
          <div className="flex justify-end space-x-2 w-full">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCropComplete}
              disabled={isProcessing || !completedCrop}
            >
              {isProcessing ? "Traitement..." : "Valider le recadrage"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 