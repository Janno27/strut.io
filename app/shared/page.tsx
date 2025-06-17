"use client"

import { useEffect, useState, Suspense, useMemo } from "react"
import { createPortal } from "react-dom"
import { useSearchParams } from "next/navigation"
import { createAnonymousClient } from "@/lib/supabase/anonymous"
import { ModelTabs } from "../../components/list/model-tabs"
import { ModelGrid } from "../../components/list/model-grid"
import { ModelSkeleton } from "../../components/list/model-skeleton"
import { WishlistDrawer } from "../../components/wishlist/wishlist-drawer"
import { SharedHeader } from "../../components/layout/shared-header"

// Type pour les modèles de la base de données
interface Model {
  id: string
  first_name: string
  last_name: string
  gender: string
  age: number
  height: number
  bust: number
  waist: number
  hips: number
  shoe_size: number
  eye_color: string
  hair_color: string
  main_image: string
  additional_images?: string[]
  instagram?: string
  models_com_link?: string
  description?: string
  agent_id: string
  created_at: string
  is_shortlisted?: boolean
  image_groups?: any
  shared_image_groups?: string[]
  books?: any[]
  shared_books?: string[]
}

// Type pour le retour de l'API Supabase
interface PackageData {
  name: string
  project_id: string
}

interface ProjectData {
  client_id: string
  name: string
}

interface ClientData {
  agent_id: string
}

interface PackageModelData {
  model_id: string
  is_shortlisted?: boolean
  shared_image_groups?: string[]
  shared_books?: string[]
}

// Type pour les modèles utilisés dans la grille
interface GridModel {
  id: string
  name: string
  age: number
  height: number
  bust: number
  waist: number
  hips: number
  imageUrl: string
  additionalImages?: string[]
  description?: string
  instagram?: string
  experience?: string[]
  models_com_link?: string
  shoe_size?: number
  eye_color?: string
  hair_color?: string
  is_shortlisted?: boolean
  image_groups?: any
  shared_image_groups?: string[]
  books?: any[]
  shared_books?: string[]
}

// Composant qui utilise useSearchParams
function SharedPageContent() {
  const searchParams = useSearchParams()
  const agentId = searchParams.get("agent")
  const packageId = searchParams.get("package")
  
  // Créer le client Supabase une seule fois avec useMemo
  const supabase = useMemo(() => createAnonymousClient(), [])
  
  // État pour les modèles
  const [femaleModels, setFemaleModels] = useState<Model[]>([])
  const [maleModels, setMaleModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<"female" | "male">("female")
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [packageName, setPackageName] = useState<string>("")
  const [projectName, setProjectName] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [hasAutoSelectedTab, setHasAutoSelectedTab] = useState(false)
  
  // État pour la wishlist
  const [favorites, setFavorites] = useState<string[]>([])
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Effet pour marquer le composant comme monté (éviter les erreurs d'hydratation)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fonctions pour gérer le localStorage des favorites
  const getFavoritesStorageKey = () => {
    // Utiliser le packageId s'il existe, sinon l'agentId
    return packageId ? `favorites_package_${packageId}` : `favorites_agent_${agentId}`
  }

  const loadFavoritesFromStorage = () => {
    if (typeof window === 'undefined') return []
    
    try {
      const storageKey = getFavoritesStorageKey()
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Erreur lors du chargement des favorites depuis le localStorage:', error)
      return []
    }
  }

  const saveFavoritesToStorage = (favorites: string[]) => {
    if (typeof window === 'undefined') return
    
    try {
      const storageKey = getFavoritesStorageKey()
      localStorage.setItem(storageKey, JSON.stringify(favorites))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favorites dans le localStorage:', error)
    }
  }

  // Charger les favorites depuis le localStorage lors du changement de package/agent
  useEffect(() => {
    if (mounted && (packageId || agentId)) {
      const storedFavorites = loadFavoritesFromStorage()
      setFavorites(storedFavorites)
    }
  }, [mounted, packageId, agentId])

  // Sauvegarder automatiquement les favorites dans le localStorage
  useEffect(() => {
    if (mounted && (packageId || agentId)) {
      saveFavoritesToStorage(favorites)
    }
  }, [favorites, mounted, packageId, agentId])

  // Charger les modèles de l'agent spécifié ou du package spécifié
  useEffect(() => {
    const fetchModels = async () => {
      if (!agentId) return
      
      try {
        setLoading(true)
        setError(null)
        setHasAutoSelectedTab(false) // Réinitialiser pour permettre une nouvelle auto-sélection
        
        // Si un packageId est fourni, essayer de charger ce package spécifique
        if (packageId) {
          console.log("Tentative de chargement du package:", packageId)
          
          try {
            // Vérifier d'abord si le package existe
            const { data: packageExists, error: packageExistsError } = await supabase
              .from("packages")
              .select("id")
              .eq("id", packageId)
            
            if (packageExistsError) {
              console.error("Erreur lors de la vérification du package:", packageExistsError)
              setError("Impossible de vérifier le package")
              throw packageExistsError
            }
            
            if (!packageExists || packageExists.length === 0) {
              console.error("Package non trouvé:", packageId)
              setError("Package non trouvé")
              throw new Error("Package non trouvé")
            }
            
            // Récupérer les détails du package
            const { data: packageData, error: packageError } = await supabase
              .from("packages")
              .select("name, project_id")
              .eq("id", packageId)
              .single()
              
            if (packageError) {
              console.error("Erreur lors de la récupération du package:", packageError)
              setError("Impossible de charger les détails du package")
              throw packageError
            }
            
            // Typer correctement les données du package
            const typedPackageData = packageData as unknown as PackageData
            
            // Récupérer le projet associé au package
            const { data: projectData, error: projectError } = await supabase
              .from("projects")
              .select("client_id, name")
              .eq("id", typedPackageData.project_id)
              .single()
              
            if (projectError) {
              console.error("Erreur lors de la récupération du projet:", projectError)
              setError("Impossible de charger les détails du projet")
              throw projectError
            }
            
            // Typer correctement les données du projet
            const typedProjectData = projectData as unknown as ProjectData
            
            // Récupérer le client associé au projet
            const { data: clientData, error: clientError } = await supabase
              .from("clients")
              .select("agent_id")
              .eq("id", typedProjectData.client_id)
              .single()
              
            if (clientError) {
              console.error("Erreur lors de la récupération du client:", clientError)
              setError("Impossible de charger les détails du client")
              throw clientError
            }
            
            // Typer correctement les données du client
            const typedClientData = clientData as unknown as ClientData
            
            // Vérifier que le package appartient à l'agent demandé
            if (typedClientData.agent_id !== agentId) {
              console.error("Ce package n'appartient pas à l'agent demandé")
              setError("Ce package n'appartient pas à l'agent demandé")
              throw new Error("Ce package n'appartient pas à l'agent demandé")
            }
            
            // Le package appartient bien à l'agent
            console.log("Package trouvé:", typedPackageData.name)
            setPackageName(typedPackageData.name)
            setProjectName(typedProjectData.name)
            
            // Récupérer les mannequins du package avec les informations de shortlist, groupes partagés et books partagés
            const { data: packageModels, error: packageModelsError } = await supabase
              .from("package_models")
              .select("model_id, is_shortlisted, shared_image_groups, shared_books")
              .eq("package_id", packageId)
              
            if (packageModelsError) {
              console.error("Erreur lors de la récupération des modèles du package:", packageModelsError)
              setError("Impossible de charger les modèles du package")
              throw packageModelsError
            }
            
            if (!packageModels || packageModels.length === 0) {
              console.log("Ce package ne contient aucun mannequin")
              setError("Ce package ne contient aucun mannequin")
              throw new Error("Ce package ne contient aucun mannequin")
            }
            
            console.log("Nombre de modèles dans le package:", packageModels.length)
            // Typer correctement les données des modèles du package
            const typedPackageModels = packageModels as unknown as PackageModelData[]
            const modelIds = typedPackageModels.map(item => item.model_id)
            
            // Récupérer les détails des modèles avec les groupes d'images et books
            const { data: modelsData, error: modelsError } = await supabase
              .from("models")
              .select("*, image_groups, books")
              .in("id", modelIds)
              
            if (modelsError) {
              console.error("Erreur lors de la récupération des détails des modèles:", modelsError)
              setError("Impossible de charger les détails des mannequins")
              throw modelsError
            }
            
            if (!modelsData || modelsData.length === 0) {
              console.log("Aucun mannequin trouvé pour les IDs spécifiés")
              setError("Aucun mannequin trouvé")
              throw new Error("Aucun mannequin trouvé")
            }
            
            console.log("Nombre de mannequins récupérés:", modelsData.length)
            
            // Typer correctement les données des modèles
            const typedModelsData = modelsData as unknown as Model[]
            
            // Créer des maps pour les informations de shortlist, groupes partagés et books partagés
            const shortlistMap = new Map<string, boolean>()
            const sharedGroupsMap = new Map<string, string[]>()
            const sharedBooksMap = new Map<string, string[]>()
            typedPackageModels.forEach(pm => {
              shortlistMap.set(pm.model_id, pm.is_shortlisted || false)
              sharedGroupsMap.set(pm.model_id, pm.shared_image_groups || [])
              sharedBooksMap.set(pm.model_id, pm.shared_books || [])
            })
            
            // Ajouter les informations de shortlist, groupes partagés et books partagés aux modèles
            const modelsWithShortlist = typedModelsData.map(model => ({
              ...model,
              is_shortlisted: shortlistMap.get(model.id) || false,
              shared_image_groups: sharedGroupsMap.get(model.id) || [],
              shared_books: sharedBooksMap.get(model.id) || []
            }))
            
            // Séparer les modèles par genre
            const female = modelsWithShortlist.filter(model => model.gender === "female")
            const male = modelsWithShortlist.filter(model => model.gender === "male")
            
            setFemaleModels(female as Model[])
            setMaleModels(male as Model[])
            setLoading(false)
            return
            
          } catch (error) {
            console.error("Erreur lors du chargement du package:", error)
            // Continuer et charger tous les modèles de l'agent
          }
        }
        
        // Si pas de package ou erreur, charger tous les modèles de l'agent
        console.log("Chargement de tous les modèles de l'agent:", agentId)
        
        const { data: modelsData, error: modelsError } = await supabase
          .from("models")
          .select("*, image_groups, books")
          .eq("agent_id", agentId)
        
        if (modelsError) {
          console.error("Erreur lors de la récupération des modèles:", modelsError)
          setError("Impossible de charger les mannequins")
        } else if (!modelsData || modelsData.length === 0) {
          console.log("Aucun mannequin trouvé pour cet agent")
          setError("Aucun mannequin trouvé pour cet agent")
        } else {
          console.log("Nombre de mannequins récupérés:", modelsData.length)
          
          // Typer correctement les données des modèles
          const typedModelsData = modelsData as unknown as Model[]
          
          // Séparer les modèles par genre
          const female = typedModelsData.filter(model => model.gender === "female")
          const male = typedModelsData.filter(model => model.gender === "male")
          
          setFemaleModels(female as Model[])
          setMaleModels(male as Model[])
          setError(null)
        }
      } catch (error) {
        console.error("Erreur générale:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchModels()
  }, [agentId, packageId, supabase])

  // Auto-sélection de l'onglet en fonction du contenu
  useEffect(() => {
    if (!loading && !hasAutoSelectedTab && (femaleModels.length > 0 || maleModels.length > 0)) {
      // Par défaut, on privilégie "female"
      // Mais si "female" est vide ou a moins de modèles que "male", on sélectionne "male"
      if (femaleModels.length === 0 || (maleModels.length > 0 && maleModels.length > femaleModels.length)) {
        setSelectedTab("male")
      } else {
        setSelectedTab("female")
      }
      setHasAutoSelectedTab(true)
    }
  }, [loading, femaleModels.length, maleModels.length, hasAutoSelectedTab])
  
  // Gestion de la wishlist
  const handleToggleFavorite = (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation()
    setFavorites(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId)
      } else {
        return [...prev, modelId]
      }
    })
  }

  const handleRemoveFavorite = (modelId: string) => {
    setFavorites(prev => prev.filter(id => id !== modelId))
  }

  // Obtenir les modèles favoris pour la wishlist
  const getFavoriteModels = (): GridModel[] => {
    const allModels = [...femaleModels, ...maleModels]
    return allModels
      .filter(model => favorites.includes(model.id))
      .map(model => ({
        id: model.id,
        name: `${model.first_name} ${model.last_name}`,
        age: model.age || 0,
        height: model.height,
        bust: model.bust,
        waist: model.waist,
        hips: model.hips,
        imageUrl: model.main_image,
        additionalImages: model.additional_images,
        instagram: model.instagram,
        description: model.description || "",
        experience: [],
        models_com_link: model.models_com_link,
        shoe_size: model.shoe_size,
        eye_color: model.eye_color,
        hair_color: model.hair_color
      }))
  }

  // Transformer les modèles pour correspondre au format attendu par ModelGrid
  const formatModelsForGrid = (models: Model[]): GridModel[] => {
    return models.map(model => {
      // Filtrer les groupes d'images selon les groupes partagés
      let filteredImageGroups = model.image_groups
      if (packageId && model.shared_image_groups && model.shared_image_groups.length > 0) {
        // Si des groupes spécifiques sont partagés, ne garder que ceux-là
        filteredImageGroups = {}
        model.shared_image_groups.forEach(groupId => {
          if (model.image_groups && model.image_groups[groupId]) {
            filteredImageGroups[groupId] = model.image_groups[groupId]
          }
        })
      }

      // Filtrer les books selon les books partagés
      let filteredBooks = model.books
      if (packageId && model.shared_books && model.shared_books.length > 0) {
        // Si des books spécifiques sont partagés, ne garder que ceux-là
        filteredBooks = (model.books || []).filter(book => 
          model.shared_books?.includes(book.id)
        )
      }

      return {
        id: model.id,
        name: `${model.first_name} ${model.last_name}`,
        age: model.age || 0,
        height: model.height,
        bust: model.bust,
        waist: model.waist,
        hips: model.hips,
        imageUrl: model.main_image,
        additionalImages: model.additional_images,
        instagram: model.instagram,
        description: model.description || "",
        experience: [],
        models_com_link: model.models_com_link,
        shoe_size: model.shoe_size,
        eye_color: model.eye_color,
        hair_color: model.hair_color,
        is_shortlisted: model.is_shortlisted || false,
        image_groups: filteredImageGroups,
        shared_image_groups: model.shared_image_groups,
        books: filteredBooks,
        shared_books: model.shared_books
      }
    })
  }
  
  // Si aucun agent n'est spécifié, afficher un message d'erreur
  if (!agentId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold">Lien invalide</h2>
        <p className="text-muted-foreground mt-2">
          Ce lien de partage n'est pas valide. Veuillez demander un nouveau lien à votre agent.
        </p>
      </div>
    )
  }
  
  return (
    <div className="w-full">
      {mounted && document.getElementById('shared-header-container') && createPortal(
        <SharedHeader 
          onOpenWishlist={() => setIsWishlistOpen(true)}
          wishlistCount={favorites.length}
        />,
        document.getElementById('shared-header-container')!
      )}
      
      {loading ? (
        <ModelSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-xl font-semibold text-red-500">Erreur</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      ) : (
        <>
          <div className="relative mb-6">
            {/* Titre du projet et package à gauche */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {projectName && (
                <span className="text-base md:text-lg font-light tracking-wide text-muted-foreground/70">
                  {projectName}
                </span>
              )}
              {projectName && packageName && (
                <span className="text-muted-foreground/50">•</span>
              )}
              {packageName && (
                <span className="text-xs md:text-sm font-normal tracking-wide text-muted-foreground/60">
                  {packageName}
                </span>
              )}
            </div>
            
            {/* Tabs au centre */}
            <div className="flex justify-center">
              <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <button
                  onClick={() => {
                    setSelectedTab("female")
                    setSelectedModelId(null)
                  }}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                    selectedTab === "female" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "hover:bg-background/50"
                  }`}
                >
                  Femme
                </button>
                <button
                  onClick={() => {
                    setSelectedTab("male")
                    setSelectedModelId(null)
                  }}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                    selectedTab === "male" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "hover:bg-background/50"
                  }`}
                >
                  Homme
                </button>
              </div>
            </div>
          </div>

          {/* Contenu des onglets */}
          <div>
            {selectedTab === "female" && (
              <ModelGrid 
                models={formatModelsForGrid(femaleModels)} 
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                selectedModelId={selectedModelId}
                onSelectModel={(id) => setSelectedModelId(id)}
                canAddModel={false}
                onOpenAddModal={() => {}}
                canEdit={false}
                onModelUpdated={() => {}}
                onModelDeleted={() => {}}
              />
            )}
            {selectedTab === "male" && (
              <ModelGrid 
                models={formatModelsForGrid(maleModels)} 
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                selectedModelId={selectedModelId}
                onSelectModel={(id) => setSelectedModelId(id)}
                canAddModel={false}
                onOpenAddModal={() => {}}
                canEdit={false}
                onModelUpdated={() => {}}
                onModelDeleted={() => {}}
              />
            )}
          </div>
        </>
      )}
      
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        favorites={getFavoriteModels()}
        onRemoveFavorite={handleRemoveFavorite}
        onSelectModel={(id) => {
          setSelectedModelId(id)
          setIsWishlistOpen(false)
        }}
      />
    </div>
  )
}

// Composant principal avec Suspense
export default function SharedPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <p>Chargement...</p>
      </div>
    }>
      <SharedPageContent />
    </Suspense>
  )
} 