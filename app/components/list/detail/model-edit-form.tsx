"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModelEditFormProps } from "./types"

export function ModelEditForm({
  formData,
  isLoading,
  onChange,
  onSelectChange
}: ModelEditFormProps) {
  return (
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
          <Input
            id="eyeColor"
            name="eyeColor"
            value={formData.eyeColor}
            onChange={onChange}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="hairColor">Couleur des cheveux</Label>
          <Input
            id="hairColor"
            name="hairColor"
            value={formData.hairColor}
            onChange={onChange}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}