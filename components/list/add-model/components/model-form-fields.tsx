import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ModelFormFieldsProps } from "../types"

export function ModelFormFields({
  formData,
  customEyeColor,
  customHairColor,
  isLoading,
  onChange,
  onSelectChange,
  onCustomValueChange
}: ModelFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Informations personnelles de base */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom <span className="text-red-500">*</span></Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="space-y-2">
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
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Genre</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => onSelectChange(value, "gender")}
            disabled={isLoading}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Sélectionnez le genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Femme</SelectItem>
              <SelectItem value="male">Homme</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
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
      </div>
      
      {/* Mensurations */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
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
        
        <div className="space-y-2">
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
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
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
        
        <div className="space-y-2">
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
        
        <div className="space-y-2">
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
      </div>
      
      {/* Caractéristiques physiques */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
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
              <SelectItem value="autre">Autre (préciser)</SelectItem>
            </SelectContent>
          </Select>
          {formData.eyeColor === "autre" && (
            <div className="mt-2">
              <Input
                placeholder="Précisez la couleur des yeux"
                value={customEyeColor}
                onChange={(e) => onCustomValueChange(e, "eyeColor")}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
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
              <SelectItem value="autre">Autre (préciser)</SelectItem>
            </SelectContent>
          </Select>
          {formData.hairColor === "autre" && (
            <div className="mt-2">
              <Input
                placeholder="Précisez la couleur des cheveux"
                value={customHairColor}
                onChange={(e) => onCustomValueChange(e, "hairColor")}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Réseaux sociaux et liens */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
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
        
        <div className="space-y-2">
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

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Ajoutez une description du modèle (parcours, expérience, style...)"
          value={formData.description}
          onChange={onChange}
          disabled={isLoading}
        />
      </div>
    </div>
  )
} 