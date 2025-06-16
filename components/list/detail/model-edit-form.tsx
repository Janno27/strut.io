"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DraggableImageGrid } from "@/components/ui/draggable-image-grid"
import { MainImageUploader } from "@/components/ui/main-image-uploader"
import { ModelEditFormProps } from "./types"

export function ModelEditForm({
  formData,
  isLoading,
  onChange,
  onSelectChange,
  // Gestion des couleurs personnalisées
  customEyeColor,
  customHairColor,
  onCustomEyeColorChange,
  onCustomHairColorChange,
  // Gestion des images
  mainImage = null,
  additionalImages = [],
  mainImageFocalPoint,
  additionalImagesFocalPoints,
  onMainImageUpload,
  onMainImageRemove,
  onMainImageEdit,
  onMainImageReposition,
  onAdditionalImagesChange,
  onAdditionalImageAdd,
  onAdditionalImageRemove,
  onAdditionalImageReposition,
  showImageManagement = false
}: ModelEditFormProps) {
  return (
    <div>
      {/* Gestion des images */}
      {showImageManagement && onMainImageUpload && onMainImageRemove && onAdditionalImagesChange && onAdditionalImageAdd && onAdditionalImageRemove && (
        <div className="mb-6 space-y-6">
          {/* Image principale */}
          <div className="space-y-2">
            <Label>Photo principale</Label>
            <MainImageUploader
              image={mainImage}
              focalPoint={mainImageFocalPoint}
              onImageUpload={onMainImageUpload}
              onImageRemove={onMainImageRemove}
              onImageEdit={onMainImageEdit}
              onImageReposition={onMainImageReposition}
              height="h-60"
            />
          </div>
          
          {/* Images supplémentaires */}
          <div className="space-y-2">
            <Label>Photos supplémentaires</Label>
            <DraggableImageGrid
              images={additionalImages}
              focalPoints={additionalImagesFocalPoints}
              onImagesChange={onAdditionalImagesChange}
              onImageAdd={onAdditionalImageAdd}
              onImageRemove={onAdditionalImageRemove}
              onImageReposition={onAdditionalImageReposition}
              allowMultiple={true}
              maxImages={10}
            />
          </div>
        </div>
      )}
      
      {/* Formulaire */}
    <div>
      {/* Nom et Prénom */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            disabled={isLoading}
          />
        </div>
      </div>
      
      {/* Description */}
      <div className="mb-6">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={formData.description}
          onChange={onChange}
          disabled={isLoading}
        />
      </div>
      
      {/* Informations principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="age">Âge</Label>
          <Input
            id="age"
            name="age"
            type="number"
            value={formData.age}
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
            disabled={isLoading}
          />
        </div>
      </div>
      
      {/* Liens sociaux et professionnels */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            name="instagram"
            placeholder="@username"
            value={formData.instagram}
            onChange={onChange}
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
            onChange={onChange}
            disabled={isLoading}
          />
        </div>
      </div>
      
      {/* Caractéristiques physiques secondaires */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div>
          <Label htmlFor="shoeSize">Pointure</Label>
          <Input
            id="shoeSize"
            name="shoeSize"
            type="number"
            step="0.5"
            value={formData.shoeSize}
            onChange={onChange}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="eyeColor">Couleur des yeux</Label>
          <Select
            value={formData.eyeColor}
            onValueChange={(value) => onSelectChange(value, "eyeColor")}
            disabled={isLoading}
          >
            <SelectTrigger id="eyeColor" className="w-full">
              <SelectValue placeholder="Sélectionnez une couleur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bleu">Bleu</SelectItem>
              <SelectItem value="vert">Vert</SelectItem>
              <SelectItem value="marron">Marron</SelectItem>
              <SelectItem value="noisette">Noisette</SelectItem>
              <SelectItem value="noir">Noir</SelectItem>
              <SelectItem value="gris">Gris</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
          {formData.eyeColor === "autre" && onCustomEyeColorChange && (
            <div className="mt-2">
              <Input
                placeholder="Précisez la couleur des yeux"
                value={customEyeColor || ""}
                onChange={(e) => onCustomEyeColorChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="hairColor">Couleur des cheveux</Label>
          <Select
            value={formData.hairColor}
            onValueChange={(value) => onSelectChange(value, "hairColor")}
            disabled={isLoading}
          >
            <SelectTrigger id="hairColor" className="w-full">
              <SelectValue placeholder="Sélectionnez une couleur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blond">Blond</SelectItem>
              <SelectItem value="brun">Brun</SelectItem>
              <SelectItem value="châtain">Châtain</SelectItem>
              <SelectItem value="roux">Roux</SelectItem>
              <SelectItem value="noir">Noir</SelectItem>
              <SelectItem value="gris">Gris/Blanc</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
          {formData.hairColor === "autre" && onCustomHairColorChange && (
            <div className="mt-2">
              <Input
                placeholder="Précisez la couleur des cheveux"
                value={customHairColor || ""}
                onChange={(e) => onCustomHairColorChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}