"use client"

import { Plus } from "lucide-react"
import { motion } from "framer-motion"

interface AddModelCardProps {
  onClick: () => void
}

export function AddModelCard({ onClick }: AddModelCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 cursor-pointer flex flex-col items-center justify-center"
    >
      <div className="flex flex-col items-center justify-center p-6 text-gray-500 dark:text-gray-400">
        <Plus className="h-10 w-10 mb-2" />
        <span className="text-lg font-medium">Ajouter un modèle</span>
      </div>
    </motion.div>
  )
} 