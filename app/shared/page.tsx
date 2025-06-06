"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/app/lib/supabase/client"
import { ModelTabs } from "../components/list/model-tabs"
import { ModelGrid } from "../components/list/model-grid"

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
}

// Composant qui utilise useSearchParams
function SharedPageContent() {
  const searchParams = useSearchParams()
  const agentId = searchParams.get("agent")
  
  // État pour les modèles
  const [femaleModels, setFemaleModels] = useState<Model[]>([])
  const [maleModels, setMaleModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<"female" | "male">("female")
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  
  // Charger les modèles de l'agent spécifié
  useEffect(() => {
    const fetchModels = async () => {
      if (!agentId) return
      
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from("models")
          .select("*")
          .eq("agent_id", agentId)
        
        if (error) {
          console.error("Erreur lors de la récupération des modèles:", error)
          return
        }
        
        if (data) {
          // Séparer les modèles par genre
          const female = data.filter(model => model.gender === "female")
          const male = data.filter(model => model.gender === "male")
          
          setFemaleModels(female)
          setMaleModels(male)
        }
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchModels()
  }, [agentId, supabase])
  
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