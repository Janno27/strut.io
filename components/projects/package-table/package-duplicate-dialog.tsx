"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchBar } from "@/components/ui/search-bar"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Heart, UserCheck, UserX, Star, Plus, Search } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-provider"
import { getMainImageFromGroups } from "@/lib/utils/image-utils"

interface Model {
  id: string
  first_name: string
  last_name: string
  image_groups?: any
  additional_images?: string[]
  is_shortlisted?: boolean
  shared_image_groups?: string[]
  shared_books?: string[]
}

interface Package {
  id: string
  name: string
  description: string
  project_id: string
}

interface PackageDuplicateDialogProps {
  isOpen: boolean
  onClose: () => void
  package: Package | null
  onSuccess: () => void
}

export function PackageDuplicateDialog({ 
  isOpen, 
  onClose, 
  package: originalPackage, 
  onSuccess 
}: PackageDuplicateDialogProps) {
  const [currentStep, setCurrentStep] = useState<'shortlist' | 'revision'>('shortlist')
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)
  const [iterationName, setIterationName] = useState('')
  const [iterationDescription, setIterationDescription] = useState('')
  const [allModels, setAllModels] = useState<Model[]>([])
  const [selectedNewModels, setSelectedNewModels] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = createClient()

  // Charger les modèles du package original
  useEffect(() => {
    if (isOpen && originalPackage) {
      loadPackageModels()
      setIterationName(`${originalPackage.name} - Itération`)
      setIterationDescription(`Itération basée sur ${originalPackage.name} avec nouveaux candidats`)
    }
  }, [isOpen, originalPackage])

  // Charger tous les modèles pour la révision
  useEffect(() => {
    if (currentStep === 'revision') {
      loadAllModels()
    }
  }, [currentStep])

  const loadPackageModels = async () => {
    if (!originalPackage) return

    try {
      const { data, error } = await supabase
        .from('package_models')
        .select(`
          model_id,
          is_shortlisted,
          shared_image_groups,
          shared_books,
          models (
            id,
            first_name,
            last_name,
            image_groups,
            additional_images
          )
        `)
        .eq('package_id', originalPackage.id)

      if (error) throw error

      const formattedModels = data?.map((item: any) => ({
        id: item.models.id,
        first_name: item.models.first_name,
        last_name: item.models.last_name,
        image_groups: item.models.image_groups,
        additional_images: item.models.additional_images,
        is_shortlisted: item.is_shortlisted || false,
        shared_image_groups: item.shared_image_groups || [],
        shared_books: item.shared_books || []
      })) || []

      setModels(formattedModels)
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les modèles du package",
        variant: "destructive"
      })
    }
  }

  const loadAllModels = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('models')
        .select('id, first_name, last_name, image_groups, additional_images')
        .eq('agent_id', user.id)
        .order('first_name')

      if (error) throw error
      setAllModels(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement de tous les modèles:', error)
    }
  }

  const toggleModelShortlist = (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, is_shortlisted: !model.is_shortlisted }
        : model
    ))
  }

  const toggleNewModelSelection = (modelId: string) => {
    setSelectedNewModels(prev => 
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    )
  }

  // Filtrer les nouveaux modèles en fonction de la recherche
  const filteredNewModels = allModels
    .filter(model => !models.some(m => m.id === model.id))
    .filter(model => {
      if (!searchQuery) return true
      const fullName = `${model.first_name} ${model.last_name}`.toLowerCase()
      return fullName.includes(searchQuery.toLowerCase())
    })

  const createIterationPackage = async () => {
    if (!originalPackage) return

    setLoading(true)
    try {
      // Créer le package d'itération
      const { data: newPackage, error: packageError } = await supabase
        .from('packages')
        .insert({
          name: iterationName,
          description: iterationDescription,
          status: 'pending',
          project_id: originalPackage.project_id,
          parent_package_id: originalPackage.id,
          package_type: 'revision'
        })
        .select()
        .single()

      if (packageError) throw packageError

      // Préparer les modèles à insérer
      const modelsToInsert: Array<{
        package_id: string
        model_id: string
        is_shortlisted: boolean
        shared_image_groups?: string[]
        shared_books?: string[]
      }> = []

      // Ajouter les modèles shortlistés (avec leurs paramètres)
      const shortlistedModels = models.filter(m => m.is_shortlisted)
      shortlistedModels.forEach(model => {
        modelsToInsert.push({
          package_id: newPackage.id,
          model_id: model.id,
          is_shortlisted: true,
          shared_image_groups: model.shared_image_groups || [],
          shared_books: model.shared_books || []
        })
      })

      // Ajouter les nouveaux modèles (non shortlistés, sans paramètres)
      selectedNewModels.forEach(modelId => {
        modelsToInsert.push({
          package_id: newPackage.id,
          model_id: modelId,
          is_shortlisted: false,
          shared_image_groups: [],
          shared_books: []
        })
      })

      if (modelsToInsert.length > 0) {
        const { error: modelsError } = await supabase
          .from('package_models')
          .insert(modelsToInsert)

        if (modelsError) throw modelsError
      }

      toast({
        title: "Itération créée",
        description: `Package "${iterationName}" créé avec ${shortlistedModels.length} shortlisté(s) et ${selectedNewModels.length} nouveau(x) candidat(s)`,
      })

      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Erreur lors de la création de l\'itération:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer l'itération",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const canCreateIteration = () => {
    const hasShortlisted = models.filter(m => m.is_shortlisted).length > 0
    const hasNewModels = selectedNewModels.length > 0
    return hasShortlisted || hasNewModels
  }

  const handleClose = () => {
    setCurrentStep('shortlist')
    setModels([])
    setSelectedNewModels([])
    setSearchQuery('')
    setIsSearchOpen(false)
    onClose()
  }

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen)
    // Si on ferme la recherche, on annule la recherche
    if (isSearchOpen) {
      setSearchQuery('')
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  if (!originalPackage) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle>Itérer le package</DialogTitle>
          <DialogDescription>
            Sélectionnez les mannequins shortlistés et ajoutez de nouveaux candidats
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="shortlist">
              1. Shortlistés
            </TabsTrigger>
            <TabsTrigger value="revision">
              2. Nouveaux candidats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shortlist" className="space-y-4">
            <div className="space-y-4">
              <div className="w-2/3">
                <Label htmlFor="iteration-name">Nom de l'itération</Label>
                <Input
                  id="iteration-name"
                  value={iterationName}
                  onChange={(e) => setIterationName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="w-2/3">
                <Label htmlFor="iteration-description">Description</Label>
                <Textarea
                  id="iteration-description"
                  value={iterationDescription}
                  onChange={(e) => setIterationDescription(e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-medium">Sélectionnez les mannequins retenus</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {models.map((model) => (
                  <div key={model.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={getMainImageFromGroups(model.image_groups, model.additional_images) || "/placeholder-image.jpg"} 
                        alt={`${model.first_name} ${model.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{model.first_name} {model.last_name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Checkbox
                            checked={model.is_shortlisted}
                            onCheckedChange={() => toggleModelShortlist(model.id)}
                          />
                          {model.is_shortlisted && (
                            <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Shortlist
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                onClick={() => setCurrentStep('revision')}
              >
                Suivant : Ajouter des candidats
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="revision" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-medium">
                  Candidats disponibles ({filteredNewModels.length})
                </h3>
                <SearchBar 
                  isOpen={isSearchOpen}
                  onToggle={handleSearchToggle}
                  onSearch={handleSearch}
                  placeholder="Rechercher par nom..."
                />
              </div>

              {filteredNewModels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'Aucun candidat trouvé pour cette recherche' : 'Aucun nouveau candidat disponible'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                  {filteredNewModels.map((model) => (
                    <div key={model.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={getMainImageFromGroups(model.image_groups, model.additional_images) || "/placeholder-image.jpg"} 
                          alt={`${model.first_name} ${model.last_name}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{model.first_name} {model.last_name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Checkbox
                              checked={selectedNewModels.includes(model.id)}
                              onCheckedChange={() => toggleNewModelSelection(model.id)}
                            />
                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
                              <Plus className="w-3 h-3 mr-1" />
                              Nouveau
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="font-medium mb-2 text-sm">Résumé de l'itération :</h4>
              <div className="space-y-1 text-sm">
                <p>• {models.filter(m => m.is_shortlisted).length} mannequin(s) shortlisté(s)</p>
                <p>• {selectedNewModels.length} nouveau(x) candidat(s)</p>
                <p className="font-medium">Total : {models.filter(m => m.is_shortlisted).length + selectedNewModels.length} mannequin(s)</p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('shortlist')}>
                Retour
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button 
                  onClick={createIterationPackage} 
                  disabled={loading || !canCreateIteration()}
                >
                  {loading ? 'Création...' : 'Créer l\'itération'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 