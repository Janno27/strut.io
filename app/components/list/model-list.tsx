"use client"

import { useState, useEffect, useCallback } from "react"
import { ModelTabs } from "./model-tabs"
import { ModelGrid } from "./model-grid"
import { WishlistDrawer } from "../wishlist/wishlist-drawer"
import { getWishlist, toggleWishlist } from "../../services/wishlist-service"
import { useAuth } from "../../context/auth-context"
import { createClient } from "@/app/lib/supabase/client"
import { AddModelModal } from "./add-model-modal"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

export function ModelList() {
  // État pour la wishlist
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"female" | "male">("female");
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  
  // État pour les modèles
  const [femaleModels, setFemaleModels] = useState<Model[]>([]);
  const [maleModels, setMaleModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Récupérer les informations de l'utilisateur connecté
  const { profile } = useAuth();

  // Vérifier si l'utilisateur peut ajouter un modèle (Admin ou Agent)
  const canAddModel = profile?.role === 'admin' || profile?.role === 'agent';

  // Fonction pour charger les modèles (rendue réutilisable)
  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      
      const supabase = createClient();
      let query = supabase.from('models').select('*');
      
      // Si l'utilisateur est un agent, filtrer par agent_id
      // Si admin, voir tous les modèles
      if (profile?.role === 'agent') {
        query = query.eq('agent_id', profile.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erreur lors de la récupération des modèles:', error);
        return;
      }
      
      if (data) {
        // Séparer les modèles par genre
        const female = data.filter(model => model.gender === 'female');
        const male = data.filter(model => model.gender === 'male');
        
        setFemaleModels(female);
        setMaleModels(male);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Charger les modèles depuis Supabase
  useEffect(() => {
    if (profile) {
      fetchModels();
    } else {
      setLoading(false);
    }
  }, [profile, fetchModels]);

  // Charger la wishlist au chargement du composant
  useEffect(() => {
    const loadedFavorites = getWishlist();
    setFavorites(loadedFavorites);
  }, []);

  // Gérer le raccourci clavier CTRL+N
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault(); // Empêcher le comportement par défaut (nouvelle fenêtre)
        setIsWishlistOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Gérer l'ajout/suppression des favoris
  const handleToggleFavorite = (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    const updatedFavorites = toggleWishlist(modelId);
    setFavorites(updatedFavorites);
  };

  // Supprimer un modèle de la wishlist
  const handleRemoveFavorite = (modelId: string) => {
    const updatedFavorites = toggleWishlist(modelId);
    setFavorites(updatedFavorites);
  };

  // Sélectionner un modèle depuis la wishlist
  const handleSelectFromWishlist = (modelId: string) => {
    // Déterminer si c'est un modèle masculin ou féminin
    const isMale = maleModels.some(m => m.id === modelId);
    setSelectedTab(isMale ? "male" : "female");
    
    // Attendre que le changement d'onglet soit effectif avant de sélectionner le modèle
    setTimeout(() => {
      setSelectedModelId(modelId);
    }, 100);
  };

  // Gérer l'ajout d'un nouveau modèle
  const handleModelAdded = () => {
    // Rafraîchir la liste des modèles
    fetchModels();
  };

  // Obtenir les modèles favoris complets
  const allModels = [...femaleModels, ...maleModels];
  
  // Vérifier si l'utilisateur peut modifier/supprimer un modèle
  const canEdit: boolean = Boolean(
    profile?.role === 'admin' || 
    (profile?.role === 'agent' && selectedModelId && 
      allModels.find(m => m.id === selectedModelId)?.agent_id === profile?.id
    )
  );
    
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
    }));
  };
  
  // Récupérer les modèles favoris au format grid
  const favoriteModels = formatModelsForGrid(
    allModels.filter(model => favorites.includes(model.id))
  );

  // Gérer l'ouverture de la modale d'ajout
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Gérer la mise à jour d'un modèle
  const handleModelUpdated = () => {
    // Rafraîchir la liste des modèles
    fetchModels();
  };

  // Gérer la suppression d'un modèle
  const handleModelDeleted = () => {
    // Fermer les détails
    setSelectedModelId(null);
    
    // Rafraîchir la liste des modèles
    fetchModels();
  };

  // Si l'utilisateur n'est pas connecté, afficher un message
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold">Connexion requise</h2>
          <p className="text-muted-foreground max-w-md">
            Vous devez être connecté pour accéder à la liste des mannequins.
            Connectez-vous ou créez un compte pour continuer.
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/login">Connexion</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Créer un compte</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Chargement des modèles...</p>
        </div>
      ) : (
        <>
          <ModelTabs
            femaleContent={
              <ModelGrid 
                models={formatModelsForGrid(femaleModels)} 
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                selectedModelId={selectedTab === "female" ? selectedModelId : null}
                onSelectModel={(id) => setSelectedModelId(id)}
                canAddModel={canAddModel}
                onOpenAddModal={handleOpenAddModal}
                canEdit={canEdit}
                onModelUpdated={handleModelUpdated}
                onModelDeleted={handleModelDeleted}
              />
            }
            maleContent={
              <ModelGrid 
                models={formatModelsForGrid(maleModels)} 
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                selectedModelId={selectedTab === "male" ? selectedModelId : null}
                onSelectModel={(id) => setSelectedModelId(id)}
                canAddModel={canAddModel}
                onOpenAddModal={handleOpenAddModal}
                canEdit={canEdit}
                onModelUpdated={handleModelUpdated}
                onModelDeleted={handleModelDeleted}
              />
            }
            onChangeTab={(tab) => {
              setSelectedTab(tab as "female" | "male");
              setSelectedModelId(null);
            }}
          />
          
          <WishlistDrawer
            isOpen={isWishlistOpen}
            onClose={() => setIsWishlistOpen(false)}
            favorites={favoriteModels}
            onRemoveFavorite={handleRemoveFavorite}
            onSelectModel={handleSelectFromWishlist}
          />
          
          <div className="fixed bottom-4 right-4 text-xs text-muted-foreground">
            Appuyez sur <kbd className="px-1 py-0.5 bg-muted rounded">CTRL</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded">N</kbd> pour ouvrir la wishlist
          </div>
          
          {/* Modal d'ajout de modèle avec callback pour rafraîchir */}
          <AddModelModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)}
            onModelAdded={handleModelAdded}
          />
        </>
      )}
    </div>
  )
} 