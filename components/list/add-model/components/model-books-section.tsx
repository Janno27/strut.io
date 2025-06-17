"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, ExternalLink, Edit2 } from "lucide-react"
import { ModelBook } from "../hooks/use-model-books"

interface ModelBooksSectionProps {
  books: ModelBook[]
  onAddBook: (name: string, url: string) => boolean
  onRemoveBook: (bookId: string) => void
  onUpdateBook: (bookId: string, name: string, url: string) => boolean
}

export function ModelBooksSection({
  books,
  onAddBook,
  onRemoveBook,
  onUpdateBook
}: ModelBooksSectionProps) {
  const [newBookName, setNewBookName] = useState("")
  const [newBookUrl, setNewBookUrl] = useState("")
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editUrl, setEditUrl] = useState("")
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({})

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

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      const success = onAddBook(newBookName, newBookUrl)
      if (success) {
        setNewBookName("")
        setNewBookUrl("")
        setErrors({})
      }
    }
  }

  // Démarrer l'édition d'un book
  const handleStartEdit = (book: ModelBook) => {
    setEditingBookId(book.id)
    setEditName(book.name)
    setEditUrl(book.url)
  }

  // Sauvegarder l'édition
  const handleSaveEdit = () => {
    if (editingBookId) {
      const newErrors: { name?: string; url?: string } = {}

      if (!editName.trim()) {
        newErrors.name = "Le nom est requis"
      }

      if (!editUrl.trim()) {
        newErrors.url = "L'URL est requise"
      } else if (!isValidUrl(editUrl.trim())) {
        newErrors.url = "URL invalide"
      }

      setErrors(newErrors)

      if (Object.keys(newErrors).length === 0) {
        const success = onUpdateBook(editingBookId, editName, editUrl)
        if (success) {
          setEditingBookId(null)
          setEditName("")
          setEditUrl("")
          setErrors({})
        }
      }
    }
  }

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingBookId(null)
    setEditName("")
    setEditUrl("")
    setErrors({})
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Books & Portfolios</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Ajoutez les liens vers les books et portfolios du mannequin
        </p>
      </div>

      {/* Formulaire d'ajout */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Ajouter un nouveau book</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="book-name" className="text-sm">Nom du book</Label>
              <Input
                id="book-name"
                placeholder="Ex: Portfolio Mode, Book Commercial..."
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="book-url" className="text-sm">URL</Label>
              <Input
                id="book-url"
                placeholder="https://..."
                value={newBookUrl}
                onChange={(e) => setNewBookUrl(e.target.value)}
                className={errors.url ? "border-red-500" : ""}
              />
              {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url}</p>}
            </div>
          </div>
          <Button 
            type="button" 
            onClick={handleAddBook}
            size="sm"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter le book
          </Button>
        </CardContent>
      </Card>

      {/* Liste des books */}
      {books.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Books ajoutés ({books.length})</Label>
          <div className="space-y-2">
            {books.map((book) => (
              <Card key={book.id} className="p-3">
                {editingBookId === book.id ? (
                  // Mode édition
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Nom</Label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <Label className="text-sm">URL</Label>
                        <Input
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className={errors.url ? "border-red-500" : ""}
                        />
                        {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url}</p>}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveEdit}
                      >
                        Sauvegarder
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Mode affichage
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{book.name}</p>
                      <a 
                        href={book.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 truncate block"
                      >
                        {book.url}
                        <ExternalLink className="w-3 h-3 inline ml-1" />
                      </a>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(book)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveBook(book.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 