"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, BookOpen, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface Book {
  id: string
  name: string
  url: string
  created_at: string
}

interface Model {
  id: string
  first_name: string
  last_name: string
  books?: Book[]
}

interface BooksSelectorProps {
  packageId: string
  modelId: string
  modelName: string
  currentSharedBooks?: string[]
  onUpdate?: () => void
}

export function BooksSelector({ 
  packageId, 
  modelId, 
  modelName, 
  currentSharedBooks = [],
  onUpdate 
}: BooksSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [model, setModel] = useState<Model | null>(null)
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const supabase = createClient()
  const { toast } = useToast()

  const loadModelDetails = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('models')
        .select('id, first_name, last_name, books')
        .eq('id', modelId)
        .single()

      if (error) throw error
      setModel(data)
    } catch (error) {
      console.error('Erreur lors du chargement du modèle:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du modèle",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadSharedBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('package_models')
        .select('shared_books')
        .eq('package_id', packageId)
        .eq('model_id', modelId)
        .single()

      if (error) throw error
      
      // Mettre à jour la sélection avec les books partagés sauvegardés
      setSelectedBooks(data?.shared_books || [])
    } catch (error) {
      console.error('Erreur lors du chargement des books partagés:', error)
      // En cas d'erreur, utiliser currentSharedBooks comme fallback
      setSelectedBooks(currentSharedBooks || [])
    }
  }

  // Charger les détails du modèle et les books partagés quand le dialog s'ouvre
  useEffect(() => {
    if (isOpen) {
      if (!model) {
        loadModelDetails()
      }
      // Charger les books partagés depuis la base de données
      loadSharedBooks()
    }
  }, [isOpen, modelId]) // Retirer les autres dépendances problématiques

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('package_models')
        .update({ shared_books: selectedBooks })
        .eq('package_id', packageId)
        .eq('model_id', modelId)

      if (error) throw error

      toast({
        title: "Books mis à jour",
        description: `Les books partagés pour ${modelName} ont été mis à jour.`
      })

      setIsOpen(false)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les books",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleBookToggle = (bookId: string, checked: boolean) => {
    if (checked) {
      setSelectedBooks(prev => [...prev, bookId])
    } else {
      setSelectedBooks(prev => prev.filter(id => id !== bookId))
    }
  }

  const availableBooks = model?.books || []
  const hasBooks = availableBooks.length > 0

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Réinitialiser les états quand on ferme le dialog
      setModel(null)
      setSelectedBooks([])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <BookOpen className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Books & Portfolios - {modelName}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : !hasBooks ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Ce modèle n'a pas de books configurés.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez les books à partager avec le client :
            </p>
            
            <div className="max-h-60 overflow-y-auto">
              <div className="space-y-3">
                {availableBooks.map(book => (
                  <Card key={book.id} className="p-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={`book-${book.id}`}
                        checked={selectedBooks?.includes(book.id) || false}
                        onCheckedChange={(checked) => 
                          handleBookToggle(book.id, checked as boolean)
                        }
                        className="mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <Label 
                          htmlFor={`book-${book.id}`}
                          className="text-sm font-medium cursor-pointer block"
                        >
                          {book.name}
                        </Label>
                        <div className="flex items-center gap-1 min-w-0">
                          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <a 
                            href={book.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 truncate min-w-0 flex-1"
                            onClick={(e) => e.stopPropagation()}
                            title={book.url}
                          >
                            {book.url.length > 50 ? `${book.url.substring(0, 47)}...` : book.url}
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 