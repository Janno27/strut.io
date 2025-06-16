"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { Settings, FolderOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface ImageGroup {
  name: string
  images: string[]
}

interface ImageGroups {
  [groupId: string]: string[] | ImageGroup
}

interface Model {
  id: string
  first_name: string
  last_name: string
  image_groups?: ImageGroups
}

interface ImageGroupsSelectorProps {
  packageId: string
  modelId: string
  modelName: string
  currentSharedGroups?: string[]
  onUpdate?: () => void
}

export function ImageGroupsSelector({ 
  packageId, 
  modelId, 
  modelName, 
  currentSharedGroups = [],
  onUpdate 
}: ImageGroupsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [model, setModel] = useState<Model | null>(null)
  const [selectedGroups, setSelectedGroups] = useState<string[]>(currentSharedGroups || [])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const supabase = createClient()
  const { toast } = useToast()

  // Charger les détails du modèle quand le dialog s'ouvre
  useEffect(() => {
    if (isOpen && !model) {
      loadModelDetails()
    }
  }, [isOpen, modelId])

  // Mettre à jour la sélection quand les groupes partagés changent
  useEffect(() => {
    setSelectedGroups(currentSharedGroups || [])
  }, [currentSharedGroups])

  const loadModelDetails = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('models')
        .select('id, first_name, last_name, image_groups')
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

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('package_models')
        .update({ shared_image_groups: selectedGroups })
        .eq('package_id', packageId)
        .eq('model_id', modelId)

      if (error) throw error

      toast({
        title: "Groupes mis à jour",
        description: `Les groupes d'images partagés pour ${modelName} ont été mis à jour.`
      })

      setIsOpen(false)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les groupes d'images",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getGroupName = (groupId: string, imageGroups: ImageGroups): string => {
    if (groupId === 'ungrouped') return "Autres"
    const group = imageGroups[groupId]
    return (group && !Array.isArray(group)) ? group.name : "Groupe sans nom"
  }

  const getGroupImageCount = (groupId: string, imageGroups: ImageGroups): number => {
    const group = imageGroups[groupId]
    if (groupId === 'ungrouped') {
      return Array.isArray(group) ? group.length : 0
    }
    return (group && !Array.isArray(group)) ? group.images.length : 0
  }

  const handleGroupToggle = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedGroups(prev => [...prev, groupId])
    } else {
      setSelectedGroups(prev => prev.filter(id => id !== groupId))
    }
  }

  const availableGroups = model?.image_groups ? Object.keys(model.image_groups) : []
  const hasGroups = availableGroups.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Groupes d'images - {modelName}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : !hasGroups ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Ce modèle n'a pas de groupes d'images configurés.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez les groupes d'images à partager avec le client :
            </p>
            
            <div className="max-h-60 overflow-y-auto">
              <div className="space-y-3">
                {availableGroups.map(groupId => {
                  const imageCount = getGroupImageCount(groupId, model!.image_groups!)
                  if (imageCount === 0) return null // Ne pas afficher les groupes vides
                  
                  return (
                    <Card key={groupId} className="p-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`group-${groupId}`}
                          checked={selectedGroups?.includes(groupId) || false}
                          onCheckedChange={(checked) => 
                            handleGroupToggle(groupId, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`group-${groupId}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {getGroupName(groupId, model!.image_groups!)}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {imageCount} image{imageCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
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