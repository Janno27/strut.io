"use client"

import { useEffect, useState, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { createAnonymousClient } from "@/lib/supabase/anonymous"
import { ModelTabs } from "../../components/list/model-tabs"
import { ModelGrid } from "../../components/list/model-grid"

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
}

// Type pour le retour de l'API Supabase
interface PackageData {
  name: string
  project_id: string
}

interface ProjectData {
  client_id: string
}

interface ClientData {
  agent_id: string
}

interface PackageModelData {
  model_id: string
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
  const [error, setError] = useState<string | null>(null)
  
  // Charger les modèles de l'agent spécifié ou du package spécifié
  useEffect(() => {
    const fetchModels = async () => {
      if (!agentId) return
      
      try {
        setLoading(true)
        setError(null)
        
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
              .select("client_id")
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
            
            // Récupérer les mannequins du package
            const { data: packageModels, error: packageModelsError } = await supabase
              .from("package_models")
              .select("model_id")
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
            
            // Récupérer les détails des modèles
            const { data: modelsData, error: modelsError } = await supabase
              .from("models")
              .select("*")
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
            
            // Séparer les modèles par genre
            const female = typedModelsData.filter(model => model.gender === "female")
            const male = typedModelsData.filter(model => model.gender === "male")
            
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
          .select("*")
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
  
  // Transformer les modèles pour correspondre au format attendu par ModelGrid
  const formatModelsForGrid = (models: Model[]): GridModel[] => {
    return models.map(model => ({
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
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Chargement des modèles...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-xl font-semibold text-red-500">Erreur</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      ) : (
        <ModelTabs
          femaleContent={
            <ModelGrid 
              models={formatModelsForGrid(femaleModels)} 
              favorites={[]}
              onToggleFavorite={() => {}}
              selectedModelId={selectedTab === "female" ? selectedModelId : null}
              onSelectModel={(id) => setSelectedModelId(id)}
              canAddModel={false}
              onOpenAddModal={() => {}}
              canEdit={false}
              onModelUpdated={() => {}}
              onModelDeleted={() => {}}
            />
          }
          maleContent={
            <ModelGrid 
              models={formatModelsForGrid(maleModels)} 
              favorites={[]}
              onToggleFavorite={() => {}}
              selectedModelId={selectedTab === "male" ? selectedModelId : null}
              onSelectModel={(id) => setSelectedModelId(id)}
              canAddModel={false}
              onOpenAddModal={() => {}}
              canEdit={false}
              onModelUpdated={() => {}}
              onModelDeleted={() => {}}
            />
          }
          onChangeTab={(tab) => {
            setSelectedTab(tab as "female" | "male")
            setSelectedModelId(null)
          }}
        />
      )}
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