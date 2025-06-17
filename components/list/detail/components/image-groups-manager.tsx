"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { DraggableImageGrid } from "@/components/ui/draggable-image-grid"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FolderPlus, Edit2, Trash2, GripVertical } from "lucide-react"
import { ImageGroups, ImageGroup, FocalPoint } from "../types"

interface ImageGroupsManagerProps {
  imageGroups: ImageGroups
  focalPoints: Record<string, FocalPoint>
  isEditing: boolean
  onImageGroupsChange: (newGroups: ImageGroups) => void
  onImageAdd: (groupId: string, e: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove: (groupId: string, imageIndex: number) => void
  onImageReposition: (groupId: string, imageIndex: number) => void
  onImageClick?: (imageUrl: string, index: number) => void
  showHeader?: boolean
  headerTitle?: string
  gridCols?: number
}

export function ImageGroupsManager({
  imageGroups,
  focalPoints,
  isEditing,
  onImageGroupsChange,
  onImageAdd,
  onImageRemove,
  onImageReposition,
  onImageClick,
  showHeader = false,
  headerTitle = "",
  gridCols = 3
}: ImageGroupsManagerProps) {
  const [newGroupName, setNewGroupName] = useState("")
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Créer un nouveau groupe
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return

    const groupId = `group_${Date.now()}`
    const newGroups = {
      ...imageGroups,
      [groupId]: {
        name: newGroupName.trim(),
        images: []
      }
    }

    onImageGroupsChange(newGroups)
    setNewGroupName("")
    setIsCreateDialogOpen(false)
    
    // Scroll automatique vers le nouveau groupe
    setTimeout(() => {
      const groupElement = document.getElementById(`group-${groupId}`)
      if (groupElement) {
        groupElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Renommer un groupe
  const handleRenameGroup = (groupId: string) => {
    if (!editingGroupName.trim() || groupId === 'ungrouped') return

    const group = imageGroups[groupId]
    if (!group || Array.isArray(group)) return

    const newGroups = {
      ...imageGroups,
      [groupId]: {
        ...group,
        name: editingGroupName.trim()
      }
    }

    onImageGroupsChange(newGroups)
    setEditingGroupId(null)
    setEditingGroupName("")
  }

  // Supprimer un groupe (déplace les images vers ungrouped)
  const handleDeleteGroup = (groupId: string) => {
    if (groupId === 'ungrouped') return

    const group = imageGroups[groupId]
    if (!group || Array.isArray(group)) return

    const ungroupedImages = Array.isArray(imageGroups.ungrouped) ? imageGroups.ungrouped : []
    const newGroups = { ...imageGroups }
    
    // Déplacer les images vers ungrouped
    newGroups.ungrouped = [...ungroupedImages, ...group.images]
    
    // Supprimer le groupe
    delete newGroups[groupId]

    onImageGroupsChange(newGroups)
  }

  // Réorganiser les images dans un groupe
  const handleImagesReorder = (groupId: string, newImages: string[]) => {
    const group = imageGroups[groupId]
    
    if (groupId === 'ungrouped') {
      const newGroups = {
        ...imageGroups,
        ungrouped: newImages
      }
      onImageGroupsChange(newGroups)
    } else if (group && !Array.isArray(group)) {
      const newGroups = {
        ...imageGroups,
        [groupId]: {
          ...group,
          images: newImages
        }
      }
      onImageGroupsChange(newGroups)
    }
  }

  // Obtenir les images d'un groupe
  const getGroupImages = (groupId: string): string[] => {
    const group = imageGroups[groupId]
    if (groupId === 'ungrouped') {
      return Array.isArray(group) ? group : []
    }
    return (group && !Array.isArray(group)) ? group.images : []
  }

  // Obtenir le nom d'un groupe
  const getGroupName = (groupId: string): string => {
    if (groupId === 'ungrouped') return "Autres"
    const group = imageGroups[groupId]
    return (group && !Array.isArray(group)) ? group.name : "Groupe sans nom"
  }

  const groupIds = Object.keys(imageGroups)

  // Obtenir l'index global d'une image
  const getGlobalImageIndex = (groupId: string, localIndex: number): number => {
    let globalIndex = 0
    
    // Parcourir tous les groupes dans l'ordre jusqu'à trouver l'image
    for (const currentGroupId of groupIds) {
      const images = getGroupImages(currentGroupId)
      
      if (currentGroupId === groupId) {
        return globalIndex + localIndex
      }
      
      globalIndex += images.length
    }
    
    return localIndex // fallback
  }

  if (!isEditing) {
    // Mode affichage
    return (
      <div className="space-y-6">
        {groupIds.map((groupId) => {
          const images = getGroupImages(groupId)
          if (images.length === 0) return null

          return (
            <div key={groupId} className="space-y-3">
              <h3 className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {getGroupName(groupId)}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((imageUrl, index) => {
                  const focalPoint = focalPoints[imageUrl]
                  const objectPosition = focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center'
                  
                  return (
                    <div 
                      key={`${groupId}-${index}`}
                      className="rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-100 dark:bg-gray-800"
                      onClick={() => onImageClick?.(imageUrl, getGlobalImageIndex(groupId, index))}
                    >
                      <div className="relative aspect-square">
                        <img
                          src={imageUrl}
                          alt={`Image ${index + 1} du groupe ${getGroupName(groupId)}`}
                          className="w-full h-full object-cover"
                          style={{ objectPosition }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Mode édition
  return (
    <div className="space-y-6">
      {/* Header avec titre et bouton créer groupe */}
      {showHeader && (
        <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10 py-2 -mt-2">
          <Label className="text-xs">{headerTitle}</Label>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 text-xs">
                <FolderPlus className="w-3 h-3 mr-1" />
                Créer un nouveau groupe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau groupe d'images</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Nom du groupe</Label>
                  <Input
                    id="group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ex: Shooting été 2024"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
                    Créer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      {/* Bouton original (affiché seulement si pas de header) */}
      {!showHeader && (
        <div className="flex justify-end">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <FolderPlus className="w-4 h-4 mr-2" />
                Créer un nouveau groupe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau groupe d'images</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Nom du groupe</Label>
                  <Input
                    id="group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ex: Shooting été 2024"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
                    Créer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Groupes d'images */}
      {groupIds.map((groupId) => (
        <div key={groupId} id={`group-${groupId}`} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-3">
          {/* Header du groupe */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GripVertical className="w-4 h-4 text-gray-400" />
              {editingGroupId === groupId ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editingGroupName}
                    onChange={(e) => setEditingGroupName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRenameGroup(groupId)}
                    onBlur={() => handleRenameGroup(groupId)}
                    className="text-sm"
                    autoFocus
                  />
                </div>
              ) : (
                <h3 className="text-sm font-medium">{getGroupName(groupId)}</h3>
              )}
            </div>
            
            {groupId !== 'ungrouped' && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingGroupId(groupId)
                    setEditingGroupName(getGroupName(groupId))
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteGroup(groupId)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Contenu du groupe */}
          <DraggableImageGrid
            images={getGroupImages(groupId)}
            focalPoints={focalPoints}
            onImagesChange={(newImages) => handleImagesReorder(groupId, newImages)}
            onImageAdd={(e) => onImageAdd(groupId, e)}
            onImageRemove={(index) => onImageRemove(groupId, index)}
            onImageReposition={(index) => onImageReposition(groupId, index)}
            allowMultiple={true}
            maxImages={20}
            gridCols={gridCols}
          />
        </div>
      ))}
    </div>
  )
} 