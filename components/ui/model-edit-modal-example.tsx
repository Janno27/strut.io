"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ModelEditForm } from "../list/detail/model-edit-form"
import { ModelFormData } from "../list/detail/types"

interface ModelEditModalExampleProps {
  isOpen: boolean
  onClose: () => void
  initialData?: ModelFormData
  initialMainImage?: string | null
  initialAdditionalImages?: string[]
}

export function ModelEditModalExample({
  isOpen,
  onClose,
  initialData,
  initialMainImage = null,
  initialAdditionalImages = []
}: ModelEditModalExampleProps) {
  const [formData, setFormData] = useState<ModelFormData>(initialData || {
    firstName: "",
    lastName: "",
    age: "",
    height: "",
    bust: "",
    waist: "",
    hips: "",
    shoeSize: "",
    eyeColor: "",
    hairColor: "",
    instagram: "",
    modelsComLink: "",
    description: ""
  })
  
  const [mainImage, setMainImage] = useState<string | null>(initialMainImage)
  const [additionalImages, setAdditionalImages] = useState<string[]>(initialAdditionalImages)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setMainImage(url)
      // Ici vous ajouteriez la logique d'upload vers votre serveur
    }
  }

  const handleMainImageRemove = () => {
    if (mainImage) {
      URL.revokeObjectURL(mainImage)
      setMainImage(null)
    }
  }

  const handleAdditionalImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages = files.map(file => URL.createObjectURL(file))
    setAdditionalImages(prev => [...prev, ...newImages])
    // Ici vous ajouteriez la logique d'upload vers votre serveur
  }

  const handleAdditionalImageRemove = (index: number) => {
    const imageToRemove = additionalImages[index]
    URL.revokeObjectURL(imageToRemove)
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleAdditionalImagesChange = (newImages: string[]) => {
    setAdditionalImages(newImages)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Ici vous ajouteriez la logique de sauvegarde
    console.log("Données du formulaire:", formData)
    console.log("Image principale:", mainImage)
    console.log("Images supplémentaires:", additionalImages)
    
    setTimeout(() => {
      setIsLoading(false)
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le modèle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <ModelEditForm
            formData={formData}
            isLoading={isLoading}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            // Gestion des images
            mainImage={mainImage}
            additionalImages={additionalImages}
            onMainImageUpload={handleMainImageUpload}
            onMainImageRemove={handleMainImageRemove}
            onAdditionalImagesChange={handleAdditionalImagesChange}
            onAdditionalImageAdd={handleAdditionalImageAdd}
            onAdditionalImageRemove={handleAdditionalImageRemove}
            showImageManagement={true}
          />
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 