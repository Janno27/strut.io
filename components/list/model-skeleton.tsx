"use client"

import { ModelTabs } from "./model-tabs"
import { motion } from "framer-motion"

// Composant Skeleton simplifié
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`} />
)

export function ModelSkeleton() {
  // Créer un tableau de 8 éléments pour simuler une grille de modèles (3x3 - 1 pour la carte d'ajout)
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i)
  
  // Composant pour un modèle skeleton
  const ModelCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden h-full">
      {/* Image du modèle */}
      <Skeleton className="w-full h-[300px]" />
      
      {/* Informations du modèle */}
      <div className="p-4 space-y-4">
        {/* Nom et icône de favoris */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        
        {/* Mensurations */}
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
        
        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
  
  // Composant pour la carte d'ajout skeleton
  const AddCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center h-[424px]">
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  )
  
  // Contenu skeleton pour les modèles
  const skeletonContent = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-2">
      {skeletonItems.map((item) => (
        <motion.div
          key={item}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: { delay: item * 0.05 }
          }}
          className="mb-6"
        >
          <ModelCardSkeleton />
        </motion.div>
      ))}
      
      {/* Carte d'ajout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: { delay: 0.4 }
        }}
        className="mb-6"
      >
        <AddCardSkeleton />
      </motion.div>
    </div>
  )
  
  return (
    <div className="w-full">
      <ModelTabs 
        femaleContent={skeletonContent}
        maleContent={skeletonContent}
        onChangeTab={() => {}}
      />
      
      {/* Indicateur de raccourci wishlist */}
      <div className="fixed bottom-4 right-4">
        <Skeleton className="h-5 w-[300px]" />
      </div>
    </div>
  )
} 