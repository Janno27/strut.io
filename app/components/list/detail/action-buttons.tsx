"use client"

import { X, Heart, Trash2, Edit2, Save, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActionButtonsProps } from "./types"

export function ActionButtons({
  isFavorite,
  canEdit,
  isEditing,
  isDeleting,
  isLoading,
  onToggleFavorite,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onClose
}: ActionButtonsProps) {
  return (
    <div className="flex justify-end mb-4 gap-2">
      {/* Bouton favoris */}
      {onToggleFavorite && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleFavorite}
          className={isFavorite ? "text-red-500" : ""}
          disabled={isEditing || isDeleting || isLoading}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""}`} />
          <span className="sr-only">{isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
        </Button>
      )}
      
      {/* Bouton d'édition */}
      {canEdit && !isEditing && !isDeleting && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onEdit}
          disabled={isLoading}
        >
          <Edit2 className="h-5 w-5" />
          <span className="sr-only">Modifier</span>
        </Button>
      )}
      
      {/* Bouton de suppression */}
      {canEdit && !isEditing && !isDeleting && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDelete}
          className="text-red-500"
          disabled={isLoading}
        >
          <Trash2 className="h-5 w-5" />
          <span className="sr-only">Supprimer</span>
        </Button>
      )}
      
      {/* Boutons de sauvegarde/annulation (mode édition) */}
      {isEditing && (
        <>
          <Button 
            variant="outline" 
            size="icon"
            onClick={onCancel}
            disabled={isLoading}
          >
            <XCircle className="h-5 w-5" />
            <span className="sr-only">Annuler</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onSave}
            className="text-green-500"
            disabled={isLoading}
          >
            <Save className="h-5 w-5" />
            <span className="sr-only">Enregistrer</span>
          </Button>
        </>
      )}
      
      {/* Bouton fermer */}
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
  )
}