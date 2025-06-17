"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Trash2, Plus, ExternalLink, Edit2, BookOpen } from "lucide-react"
import { ModelBook } from "../../add-model/hooks/use-model-books"

interface ModelBooksDisplayProps {
  books: ModelBook[]
  isEditing: boolean
  onAddBook?: (name: string, url: string) => boolean
  onRemoveBook?: (bookId: string) => void
  onUpdateBook?: (bookId: string, name: string, url: string) => boolean
}

export function ModelBooksDisplay({
  books = [],
  isEditing,
  onAddBook,
  onRemoveBook,
  onUpdateBook
}: ModelBooksDisplayProps) {
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
    if (!onAddBook) return

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
    if (!editingBookId || !onUpdateBook) return

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

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingBookId(null)
    setEditName("")
    setEditUrl("")
    setErrors({})
  }

  // Si pas de books et pas en mode édition, ne rien afficher
  if (!books.length && !isEditing) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-base font-medium">Books & Portfolios</h3>
        {books.length > 0 && (
          <span className="text-sm text-muted-foreground">({books.length})</span>
        )}
      </div>

      {/* Mode édition : formulaire d'ajout simplifié */}
      {isEditing && (
        <div className="border rounded-lg p-3 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <Input
              placeholder="Nom du book"
              value={newBookName}
              onChange={(e) => setNewBookName(e.target.value)}
              className={`text-sm ${errors.name ? "border-red-500" : ""}`}
            />
            <Input
              placeholder="URL (https://...)"
              value={newBookUrl}
              onChange={(e) => setNewBookUrl(e.target.value)}
              className={`text-sm ${errors.url ? "border-red-500" : ""}`}
            />
          </div>
          {(errors.name || errors.url) && (
            <div className="mb-2">
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              {errors.url && <p className="text-xs text-red-500">{errors.url}</p>}
            </div>
          )}
          <Button 
            type="button" 
            onClick={handleAddBook}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Ajouter un book
          </Button>
        </div>
      )}

      {/* Liste des books */}
      {books.length > 0 && (
        <div className="space-y-2">
          {books.map((book) => (
            <div key={book.id} className="border rounded p-2 bg-background">
              {editingBookId === book.id && isEditing ? (
                // Mode édition
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`text-sm ${errors.name ? "border-red-500" : ""}`}
                    />
                    <Input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className={`text-sm ${errors.url ? "border-red-500" : ""}`}
                    />
                  </div>
                  {(errors.name || errors.url) && (
                    <div>
                      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                      {errors.url && <p className="text-xs text-red-500">{errors.url}</p>}
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
                      className="text-xs text-blue-600 hover:text-blue-800 truncate block flex items-center gap-1"
                    >
                      <span className="truncate">{book.url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(book)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveBook?.(book.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 