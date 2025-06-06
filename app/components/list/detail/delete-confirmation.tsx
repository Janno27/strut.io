"use client"

import { Button } from "@/components/ui/button"
import { DeleteConfirmationProps } from "./types"

export function DeleteConfirmation({
  isVisible,
  isLoading,
  onConfirm,
  onCancel
}: DeleteConfirmationProps) {
  if (!isVisible) return null

  return (
    <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md">
      <p className="text-red-600 font-medium mb-2">
        Êtes-vous sûr de vouloir supprimer ce modèle ?
      </p>
      <p className="text-sm text-red-500 mb-4">
        Cette action est irréversible et supprimera également toutes les images associées.
      </p>
      <div className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Suppression..." : "Confirmer la suppression"}
        </Button>
      </div>
    </div>
  )
}