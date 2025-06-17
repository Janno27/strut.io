import { useState, useCallback } from "react"
import { ModelBook } from "../../add-model/hooks/use-model-books"

interface UseModelBooksManagementProps {
  model: any
  isEditing: boolean
}

export function useModelBooksManagement({ model, isEditing }: UseModelBooksManagementProps) {
  // État pour les books
  const [books, setBooks] = useState<ModelBook[]>(() => {
    // Initialiser avec les books existants du modèle
    if (model?.books && Array.isArray(model.books)) {
      return model.books
    }
    return []
  })

  // Ajouter un nouveau book
  const addBook = useCallback((name: string, url: string) => {
    if (!name.trim() || !url.trim()) return false

    const newBook: ModelBook = {
      id: crypto.randomUUID(),
      name: name.trim(),
      url: url.trim(),
      created_at: new Date().toISOString()
    }

    setBooks(prev => [...prev, newBook])
    return true
  }, [])

  // Supprimer un book
  const removeBook = useCallback((bookId: string) => {
    setBooks(prev => prev.filter(book => book.id !== bookId))
  }, [])

  // Modifier un book
  const updateBook = useCallback((bookId: string, name: string, url: string) => {
    if (!name.trim() || !url.trim()) return false

    setBooks(prev => prev.map(book => 
      book.id === bookId 
        ? { ...book, name: name.trim(), url: url.trim() }
        : book
    ))
    return true
  }, [])

  // Réinitialiser avec les books du modèle
  const resetBooks = useCallback(() => {
    if (model?.books && Array.isArray(model.books)) {
      setBooks(model.books)
    } else {
      setBooks([])
    }
  }, [model?.books])

  // Obtenir les books au format JSON pour la sauvegarde
  const getBooksForSave = useCallback(() => {
    return books.length > 0 ? books : null
  }, [books])

  return {
    books,
    setBooks,
    addBook,
    removeBook,
    updateBook,
    resetBooks,
    getBooksForSave
  }
} 