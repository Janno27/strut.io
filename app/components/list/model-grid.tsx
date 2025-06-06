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
  onModelDeleted
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
    setSelectedModelId(id);
    onSelectModel(id);
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
          {selectedModelId && selectedModel ? (
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
          {models.filter(model => !selectedModelId || model.id !== selectedModelId).map((model, index) => {
            // Calculer la position dans la grille
            const column = index % 3;
            const row = Math.floor(index / 3);
            
            return (
              <motion.div
                key={model.id}
                layout
                layoutId={`model-${model.id}`}
                initial={false}
                animate={{
                  y: selectedModelId ? detailHeight : 0,
                  opacity: selectedModelId ? 0.8 : 1,
                  scale: selectedModelId ? 0.98 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: selectedModelId ? column * 0.05 + row * 0.05 : 0,
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

          {/* Carte d'ajout de modèle (uniquement pour les Admin/Agent) */}
          {canAddModel && !selectedModelId && (
            <motion.div
              layout
              layoutId="add-model-card"
              className="mb-6"
            >
              <AddModelCard onClick={handleOpenAddModal} />
            </motion.div>
          )}
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