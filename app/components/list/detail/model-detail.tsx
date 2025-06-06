"use client"

import Image from "next/image"
import { X, Heart, Trash2, Edit2, Save, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createClient } from "@/app/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

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
  models_com_link?: string
  shoe_size?: number
  eye_color?: string
  hair_color?: string
  first_name?: string
  last_name?: string
  agent_id?: string
}

interface ModelDetailProps {
  model: Model
  onClose: () => void
  isFavorite?: boolean
  onToggleFavorite?: (e: React.MouseEvent, modelId: string) => void
  canEdit?: boolean
  onModelUpdated?: () => void
  onModelDeleted?: () => void
}

export function ModelDetail({ 
  model, 
  onClose, 
  isFavorite = false, 
  onToggleFavorite,
  canEdit = false,
  onModelUpdated,
  onModelDeleted
}: ModelDetailProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
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
  const [isLoading, setIsLoading] = useState(false)
  
  const supabase = createClient()
  const { toast } = useToast()
  
  // Obtenir le prénom et le nom
  const [firstName, lastName] = model.name?.split(' ') || ["", ""]
  
  // Images supplémentaires (ou liste vide si aucune)
  const additionalImages = model.additionalImages || []

  // Initialiser le formulaire avec les données du modèle
  useEffect(() => {
    if (model) {
      setFormData({
        firstName: model.first_name || firstName,
        lastName: model.last_name || lastName,
        age: model.age?.toString() || "",
        height: model.height?.toString() || "",
        bust: model.bust?.toString() || "",
        waist: model.waist?.toString() || "",
        hips: model.hips?.toString() || "",
        shoeSize: model.shoe_size?.toString() || "",
        eyeColor: model.eye_color || "",
        hairColor: model.hair_color || "",
        instagram: model.instagram || "",
        modelsComLink: model.models_com_link || "",
        description: model.description || ""
      })
    }
  }, [model, firstName, lastName])

  // Gérer le clic sur le bouton favoris
  const handleFavoriteClick = (e: React.MouseEvent) => {
    if (onToggleFavorite) {
      onToggleFavorite(e, model.id);
    }
  };
  
  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // Gérer les changements de select
  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // Basculer en mode édition
  const handleEditClick = () => {
    setIsEditing(true)
  }
  
  // Annuler l'édition
  const handleCancelEdit = () => {
    setIsEditing(false)
    // Réinitialiser le formulaire
    setFormData({
      firstName: model.first_name || firstName,
      lastName: model.last_name || lastName,
      age: model.age?.toString() || "",
      height: model.height?.toString() || "",
      bust: model.bust?.toString() || "",
      waist: model.waist?.toString() || "",
      hips: model.hips?.toString() || "",
      shoeSize: model.shoe_size?.toString() || "",
      eyeColor: model.eye_color || "",
      hairColor: model.hair_color || "",
      instagram: model.instagram || "",
      modelsComLink: model.models_com_link || "",
      description: model.description || ""
    })
  }
  
  // Sauvegarder les modifications
  const handleSaveEdit = async () => {
    try {
      setIsLoading(true)
      
      // Préparer les données à mettre à jour
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        age: parseInt(formData.age) || null,
        height: parseInt(formData.height) || null,
        bust: parseInt(formData.bust) || null,
        waist: parseInt(formData.waist) || null,
        hips: parseInt(formData.hips) || null,
        shoe_size: parseFloat(formData.shoeSize) || null,
        eye_color: formData.eyeColor || null,
        hair_color: formData.hairColor || null,
        instagram: formData.instagram || null,
        models_com_link: formData.modelsComLink || null,
        description: formData.description || null
      }
      
      // Mettre à jour les données dans Supabase
      const { error } = await supabase
        .from('models')
        .update(updateData)
        .eq('id', model.id)
      
      if (error) {
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
      }
      
      toast({
        title: "Succès",
        description: "Le modèle a été mis à jour avec succès"
      })
      
      // Sortir du mode édition
      setIsEditing(false)
      
      // Notifier le parent que le modèle a été mis à jour
      if (onModelUpdated) {
        onModelUpdated()
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Demande de confirmation pour la suppression
  const handleDeleteClick = () => {
    setIsDeleting(true)
  }
  
  // Annuler la suppression
  const handleCancelDelete = () => {
    setIsDeleting(false)
  }
  
  // Confirmer et exécuter la suppression
  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true)
      
      // 1. Récupérer les détails du modèle pour obtenir les chemins d'images
      const { data: modelData, error: fetchError } = await supabase
        .from('models')
        .select('*')
        .eq('id', model.id)
        .single()
      
      if (fetchError) {
        throw new Error(`Erreur lors de la récupération des détails: ${fetchError.message}`)
      }
      
      // 2. Supprimer les images du bucket Storage
      // - Image principale
      if (modelData.main_image) {
        const mainImagePath = modelData.main_image.split('/').pop()
        const { error: mainImageError } = await supabase.storage
          .from('models')
          .remove([mainImagePath])
        
        if (mainImageError) {
          console.error("Erreur lors de la suppression de l'image principale:", mainImageError)
        }
      }
      
      // - Images supplémentaires
      if (modelData.additional_images && modelData.additional_images.length > 0) {
        const additionalImagePaths = modelData.additional_images.map(
          (url: string) => url.split('/').pop()
        )
        
        for (const path of additionalImagePaths) {
          const { error: additionalImageError } = await supabase.storage
            .from('models')
            .remove([path])
          
          if (additionalImageError) {
            console.error(`Erreur lors de la suppression de l'image ${path}:`, additionalImageError)
          }
        }
      }
      
      // 3. Supprimer l'entrée dans la table models
      const { error: deleteError } = await supabase
        .from('models')
        .delete()
        .eq('id', model.id)
      
      if (deleteError) {
        throw new Error(`Erreur lors de la suppression: ${deleteError.message}`)
      }
      
      toast({
        title: "Suppression réussie",
        description: "Le modèle a été supprimé avec succès"
      })
      
      // Fermer la fenêtre de détail
      onClose()
      
      // Notifier le parent que le modèle a été supprimé
      if (onModelDeleted) {
        onModelDeleted()
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setIsDeleting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4 gap-2">
        {/* Boutons d'action */}
        {onToggleFavorite && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleFavoriteClick}
            className={isFavorite ? "text-red-500" : ""}
            disabled={isEditing || isDeleting || isLoading}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""}`} />
            <span className="sr-only">{isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
          </Button>
        )}
        
        {/* Bouton d'édition (visible uniquement si canEdit est true) */}
        {canEdit && !isEditing && !isDeleting && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleEditClick}
            disabled={isLoading}
          >
            <Edit2 className="h-5 w-5" />
            <span className="sr-only">Modifier</span>
          </Button>
        )}
        
        {/* Bouton de suppression (visible uniquement si canEdit est true) */}
        {canEdit && !isEditing && !isDeleting && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDeleteClick}
            className="text-red-500"
            disabled={isLoading}
          >
            <Trash2 className="h-5 w-5" />
            <span className="sr-only">Supprimer</span>
          </Button>
        )}
        
        {/* Boutons de sauvegarde/annulation (visibles uniquement en mode édition) */}
        {isEditing && (
          <>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleCancelEdit}
              disabled={isLoading}
            >
              <XCircle className="h-5 w-5" />
              <span className="sr-only">Annuler</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSaveEdit}
              className="text-green-500"
              disabled={isLoading}
            >
              <Save className="h-5 w-5" />
              <span className="sr-only">Enregistrer</span>
            </Button>
          </>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Fermer</span>
        </Button>
      </div>
      
      {/* Confirmation de suppression */}
      {isDeleting && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md">
          <p className="text-red-600 font-medium mb-2">Êtes-vous sûr de vouloir supprimer ce modèle ?</p>
          <p className="text-sm text-red-500 mb-4">Cette action est irréversible et supprimera également toutes les images associées.</p>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancelDelete}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Suppression..." : "Confirmer la suppression"}
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-2">
        {/* Image principale */}
        <div className="mb-4">
          <div className="flex flex-col">
            <div className="rounded-xl overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={model.imageUrl}
                  alt={model.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Informations du modèle */}
        <div className="md:col-span-2 mb-4">
          <div className="h-full flex flex-col justify-between">
            <div>
              {/* Nom/Prénom - éditable ou non */}
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <h2 className="text-2xl font-bold mb-4">{firstName} {lastName}</h2>
              )}
              
              {/* Description - éditable ou non */}
              {isEditing ? (
                <div className="mb-6">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              ) : model.description ? (
                <div className="mb-6">
                  <p className="text-muted-foreground">{model.description}</p>
                </div>
              ) : null}
              
              {/* Informations principales - éditables ou non */}
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="age">Âge</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Taille (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bust">Buste (cm)</Label>
                    <Input
                      id="bust"
                      name="bust"
                      type="number"
                      value={formData.bust}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="waist">Tour de taille (cm)</Label>
                    <Input
                      id="waist"
                      name="waist"
                      type="number"
                      value={formData.waist}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hips">Hanches (cm)</Label>
                    <Input
                      id="hips"
                      name="hips"
                      type="number"
                      value={formData.hips}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Âge</p>
                    <p className="font-medium">{model.age} ans</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taille</p>
                    <p className="font-medium">{model.height} cm</p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <p className="text-sm text-muted-foreground">Mensurations</p>
                          <p className="font-medium cursor-help">{model.bust}/{model.waist}/{model.hips}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Buste: {model.bust} cm</p>
                        <p>Taille: {model.waist} cm</p>
                        <p>Hanches: {model.hips} cm</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              
              {/* Liens sociaux et professionnels - éditables ou non */}
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      placeholder="@username"
                      value={formData.instagram}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="modelsComLink">Models.com</Label>
                    <Input
                      id="modelsComLink"
                      name="modelsComLink"
                      placeholder="https://models.com/..."
                      value={formData.modelsComLink}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {model.instagram && (
                    <div>
                      <p className="text-sm text-muted-foreground">Instagram</p>
                      <a 
                        href={`https://instagram.com/${model.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        @{model.instagram}
                      </a>
                    </div>
                  )}
                  {model.models_com_link && (
                    <div>
                      <p className="text-sm text-muted-foreground">Models.com</p>
                      <a 
                        href={model.models_com_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        Voir le profil
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              {/* Caractéristiques physiques secondaires - éditables ou non */}
              {isEditing ? (
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div>
                    <Label htmlFor="shoeSize">Pointure</Label>
                    <Input
                      id="shoeSize"
                      name="shoeSize"
                      type="number"
                      step="0.5"
                      value={formData.shoeSize}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eyeColor">Couleur des yeux</Label>
                    <Input
                      id="eyeColor"
                      name="eyeColor"
                      value={formData.eyeColor}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hairColor">Couleur des cheveux</Label>
                    <Input
                      id="hairColor"
                      name="hairColor"
                      value={formData.hairColor}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {model.shoe_size && (
                    <div>
                      <p className="text-sm text-muted-foreground">Pointure</p>
                      <p className="font-medium">{model.shoe_size}</p>
                    </div>
                  )}
                  {model.eye_color && (
                    <div>
                      <p className="text-sm text-muted-foreground">Yeux</p>
                      <p className="font-medium">{model.eye_color}</p>
                    </div>
                  )}
                  {model.hair_color && (
                    <div>
                      <p className="text-sm text-muted-foreground">Cheveux</p>
                      <p className="font-medium">{model.hair_color}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {model.experience && model.experience.length > 0 && !isEditing && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Expérience</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {model.experience.map((exp, index) => (
                    <li key={index}>{exp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Images supplémentaires (masquées en mode édition) */}
        {!isEditing && additionalImages.map((imageUrl, index) => (
          <div key={index} className="mb-4">
            <div 
              className="rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(imageUrl)}
            >
              <div className="relative aspect-square">
                <Image
                  src={imageUrl}
                  alt={`${model.name} - photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal pour afficher l'image en grand format */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-4xl h-auto max-h-[90vh]">
            <Image
              src={selectedImage}
              alt={model.name}
              fill
              className="object-contain"
              sizes="90vw"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Fermer</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 