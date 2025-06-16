"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion, LayoutGroup } from "framer-motion"
import { ModelCard } from "./model-card"
import { ModelDetail } from "./detail/model-detail"
import { AddModelCard } from "./add-model-card"
import { AddModelModal } from "./add-model-modal"

interface Model {
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
}

export interface ModelGridProps {
  models: Model[]
  favorites: string[]
  onToggleFavorite: (e: React.MouseEvent, modelId: string) => void
  selectedModelId: string | null
  onSelectModel: (id: string) => void
  canAddModel: boolean
  onOpenAddModal: () => void
  canEdit: boolean
  onModelUpdated: () => void
  onModelDeleted: () => void
  isSharedView?: boolean
}

export function ModelGrid({ 
  models, 
  favorites,
  onToggleFavorite,
  selectedModelId: externalSelectedId = null,
  onSelectModel,
  canAddModel = false,
  onOpenAddModal,
  canEdit = false,
  onModelUpdated,
  onModelDeleted,
  isSharedView = false
}: ModelGridProps) {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [detailHeight, setDetailHeight] = useState(0)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Synchroniser l'ID sélectionné externe avec l'état local
  useEffect(() => {
    setSelectedModelId(externalSelectedId);
  }, [externalSelectedId]);

  // Trouver le modèle sélectionné
  const selectedModel = models.find(model => model.id === selectedModelId)

  // Fonction pour fermer les détails
  const handleClose = () => {
    setSelectedModelId(null)
    onSelectModel('');
  }

  // Fonction pour sélectionner un modèle
  const handleSelectModel = (id: string) => {
    if (isSharedView) {
      // En mode shared view, on délègue entièrement la gestion au parent
      onSelectModel(id);
    } else {
      // En mode normal, on gère aussi l'état local
      setSelectedModelId(id);
      onSelectModel(id);
      
      // Scroll vers le haut de la page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Mettre à jour la hauteur du détail pour le décalage
  useEffect(() => {
    if (selectedModelId) {
      // Attendre que le DOM soit mis à jour
      setTimeout(() => {
        const detailElement = document.getElementById('model-detail')
        if (detailElement) {
          setDetailHeight(detailElement.offsetHeight)
        }
      }, 100)
    } else {
      setDetailHeight(0)
    }
  }, [selectedModelId])

  // Fonction pour ouvrir la modale d'ajout
  const handleOpenAddModal = () => {
    if (onOpenAddModal) {
      onOpenAddModal();  // Utiliser la fonction du parent si elle existe
    } else {
      setIsAddModalOpen(true);  // Sinon utiliser le state local
    }
  };

  return (
    <LayoutGroup>
      <div className="w-full">
        <AnimatePresence mode="sync">
          {selectedModelId && selectedModel && !isSharedView ? (
            <motion.div
              id="model-detail"
              key="detail"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="w-full"
            >
              <ModelDetail 
                model={selectedModel} 
                onClose={handleClose} 
                isFavorite={favorites.includes(selectedModel.id)}
                onToggleFavorite={onToggleFavorite}
                canEdit={canEdit}
                onModelUpdated={onModelUpdated}
                onModelDeleted={onModelDeleted}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-2">
          {/* Carte d'ajout de modèle en première position */}
          {canAddModel && (!selectedModelId || isSharedView) && (
            <motion.div
              layout
              layoutId="add-model-card"
              className="mb-6"
            >
              <AddModelCard onClick={handleOpenAddModal} />
            </motion.div>
          )}

          {models
            .filter(model => model && model.id && (!selectedModelId || model.id !== selectedModelId || isSharedView))
            .sort((a, b) => {
              // Extraire le prénom (premier mot du nom)
              const firstNameA = a.name.split(' ')[0] || '';
              const firstNameB = b.name.split(' ')[0] || '';
              return firstNameA.localeCompare(firstNameB, 'fr', { sensitivity: 'base' });
            })
            .map((model, index) => {
            // Calculer la position dans la grille
            const column = index % 3;
            const row = Math.floor(index / 3);
            
            return (
              <motion.div
                key={`model-${model.id}-${index}`}
                layout
                layoutId={`model-${model.id}-${index}`}
                initial={false}
                animate={{
                  y: selectedModelId && !isSharedView ? Math.max(detailHeight - 500, 0) : 0,
                  opacity: selectedModelId && !isSharedView ? 0.8 : 1,
                  scale: selectedModelId && !isSharedView ? 0.98 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: selectedModelId && !isSharedView ? column * 0.05 + row * 0.05 : 0,
                }}
                className="mb-6"
              >
                <ModelCard
                  model={model}
                  onClick={() => handleSelectModel(model.id)}
                  isSelected={false}
                  isFavorite={favorites.includes(model.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Modal d'ajout de modèle */}
        <AddModelModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      </div>
    </LayoutGroup>
  )
} 