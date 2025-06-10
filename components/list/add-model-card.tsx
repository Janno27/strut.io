"use client"

import { Plus } from "lucide-react"
import { motion } from "framer-motion"

interface AddModelCardProps {
  onClick: () => void
}

export function AddModelCard({ onClick }: AddModelCardProps) {
  return (
    <div className="flex flex-col cursor-pointer relative">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="rounded-xl overflow-hidden mb-1"
      >
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <Plus className="h-12 w-12 mb-2" />
            <span className="text-base font-medium">Ajouter</span>
            <span className="text-sm">un modèle</span>
          </div>
        </div>
             </motion.div>
     </div>
  )
} 