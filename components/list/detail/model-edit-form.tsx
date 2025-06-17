"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DraggableImageGrid } from "@/components/ui/draggable-image-grid"
import { MainImageUploader } from "@/components/ui/main-image-uploader"

import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, User, Ruler, Eye, Link, BookOpen, Edit, Trash2 } from "lucide-react"
import { ModelBooksSectionSimple } from "../add-model/components/model-books-section-simple"
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
  showImageManagement = false,
  // Gestion des books
  books = [],
  onAddBook,
  onRemoveBook,
  onUpdateBook
}: ModelEditFormProps) {
  // États pour gérer l'ouverture/fermeture des sections
  const [openSections, setOpenSections] = useState({
    basic: true,
    measurements: true,
    physical: true,
    social: true,
    books: true
  })

  // États pour la gestion des books
  const [newBookName, setNewBookName] = useState("")
  const [newBookUrl, setNewBookUrl] = useState("")
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editUrl, setEditUrl] = useState("")
  const [bookErrors, setBookErrors] = useState<{ name?: string; url?: string }>({})

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Valider une URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Gérer l'ajout d'un nouveau book
  const handleAddBook = () => {
    const newErrors: { name?: string; url?: string } = {}

    if (!newBookName.trim()) {
      newErrors.name = "Le nom est requis"
    }

    if (!newBookUrl.trim()) {
      newErrors.url = "L'URL est requise"
    } else if (!isValidUrl(newBookUrl.trim())) {
      newErrors.url = "URL invalide"
    }

    setBookErrors(newErrors)

    if (Object.keys(newErrors).length === 0 && onAddBook) {
      const success = onAddBook(newBookName, newBookUrl)
      if (success) {
        setNewBookName("")
        setNewBookUrl("")
        setBookErrors({})
      }
    }
  }

  // Démarrer l'édition d'un book
  const handleStartEdit = (book: any) => {
    setEditingBookId(book.id)
    setEditName(book.name)
    setEditUrl(book.url)
  }

  // Sauvegarder l'édition
  const handleSaveEdit = () => {
    if (editingBookId && onUpdateBook) {
      const newErrors: { name?: string; url?: string } = {}

      if (!editName.trim()) {
        newErrors.name = "Le nom est requis"
      }

      if (!editUrl.trim()) {
        newErrors.url = "L'URL est requise"
      } else if (!isValidUrl(editUrl.trim())) {
        newErrors.url = "URL invalide"
      }

      setBookErrors(newErrors)

      if (Object.keys(newErrors).length === 0) {
        const success = onUpdateBook(editingBookId, editName, editUrl)
        if (success) {
          setEditingBookId(null)
          setEditName("")
          setEditUrl("")
          setBookErrors({})
        }
      }
    }
  }

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingBookId(null)
    setEditName("")
    setEditUrl("")
    setBookErrors({})
  }

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
      
      {/* Formulaire organisé en sections */}
      <div className="space-y-4">
        
        {/* Section 1: Informations de base */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div 
            className="cursor-pointer select-none flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-3"
            onClick={() => toggleSection('basic')}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <h3 className="text-sm font-medium">Informations de base</h3>
            </div>
            {openSections.basic ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
          {openSections.basic && (
            <div className="space-y-4">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-xs">Prénom</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={onChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={onChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {/* Âge */}
              <div>
                <Label htmlFor="age" className="text-xs">Âge</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={onChange}
                  disabled={isLoading}
                  className="w-32"
                />
              </div>
              
              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-xs">Description</Label>
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
            </div>
          )}
        </div>

        {/* Section 2: Mensurations */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div 
            className="cursor-pointer select-none flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-3"
            onClick={() => toggleSection('measurements')}
          >
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              <h3 className="text-sm font-medium">Mensurations</h3>
            </div>
            {openSections.measurements ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
          {openSections.measurements && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height" className="text-xs">Taille (cm)</Label>
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
                <Label htmlFor="bust" className="text-xs">Buste (cm)</Label>
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
                <Label htmlFor="waist" className="text-xs">Tour de taille (cm)</Label>
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
                <Label htmlFor="hips" className="text-xs">Hanches (cm)</Label>
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
          )}
        </div>

        {/* Section 3: Caractéristiques physiques */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div 
            className="cursor-pointer select-none flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-3"
            onClick={() => toggleSection('physical')}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <h3 className="text-sm font-medium">Caractéristiques physiques</h3>
            </div>
            {openSections.physical ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
          {openSections.physical && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="shoeSize" className="text-xs">Pointure</Label>
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
                <Label htmlFor="eyeColor" className="text-xs">Yeux</Label>
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
                <Label htmlFor="hairColor" className="text-xs">Cheveux</Label>
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
          )}
        </div>

        {/* Section 4: Réseaux sociaux et liens */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div 
            className="cursor-pointer select-none flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-3"
            onClick={() => toggleSection('social')}
          >
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              <h3 className="text-sm font-medium">Réseaux sociaux et liens</h3>
            </div>
            {openSections.social ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
          {openSections.social && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram" className="text-xs">Instagram</Label>
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
                <Label htmlFor="modelsComLink" className="text-xs">Models.com</Label>
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
          )}
        </div>

        {/* Section 5: Books & Portfolios */}
        {onAddBook && onRemoveBook && onUpdateBook && (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div 
              className="cursor-pointer select-none flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-3"
              onClick={() => toggleSection('books')}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <h3 className="text-sm font-medium">Books & Portfolios</h3>
              </div>
              {openSections.books ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </div>
            {openSections.books && (
              <div className="space-y-4">
                {/* Champs directement dans la section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Nom du book</Label>
                    <Input
                      placeholder="Ex: Portfolio Mode..."
                      className={`text-sm ${bookErrors.name ? "border-red-500" : ""}`}
                      value={newBookName}
                      onChange={(e) => setNewBookName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">URL</Label>
                    <Input
                      placeholder="https://..."
                      className={`text-sm ${bookErrors.url ? "border-red-500" : ""}`}
                      value={newBookUrl}
                      onChange={(e) => setNewBookUrl(e.target.value)}
                    />
                  </div>
                </div>
                {(bookErrors.name || bookErrors.url) && (
                  <div>
                    {bookErrors.name && <p className="text-xs text-red-500">{bookErrors.name}</p>}
                    {bookErrors.url && <p className="text-xs text-red-500">{bookErrors.url}</p>}
                  </div>
                )}
                <Button 
                  type="button" 
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={handleAddBook}
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  Ajouter un book
                </Button>
                
                {/* Liste des books existants */}
                {books.length > 0 && (
                  <div className="space-y-2">
                    {books.map((book: any) => (
                      <div key={book.id} className="border rounded p-2 bg-background">
                        {editingBookId === book.id ? (
                          // Mode édition
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className={`text-sm ${bookErrors.name ? "border-red-500" : ""}`}
                              />
                              <Input
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                className={`text-sm ${bookErrors.url ? "border-red-500" : ""}`}
                              />
                            </div>
                            {(bookErrors.name || bookErrors.url) && (
                              <div>
                                {bookErrors.name && <p className="text-xs text-red-500">{bookErrors.name}</p>}
                                {bookErrors.url && <p className="text-xs text-red-500">{bookErrors.url}</p>}
                              </div>
                            )}
                            <div className="flex justify-end gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="text-xs"
                              >
                                Annuler
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleSaveEdit}
                                className="text-xs"
                              >
                                Sauvegarder
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Mode affichage
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{book.name}</p>
                              <a 
                                href={book.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 truncate block"
                              >
                                {book.url}
                              </a>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleStartEdit(book)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveBook && onRemoveBook(book.id)}
                                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  )
}