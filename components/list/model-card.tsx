"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"

interface ModelCardProps {
  model: {
    id: string
    name: string
    age: number
    height: number
    bust: number
    waist: number
    hips: number
    imageUrl: string
  }
  onClick: () => void
  isSelected: boolean
  isFavorite: boolean
  onToggleFavorite: (e: React.MouseEvent, id: string) => void
}

export function ModelCard({
  model,
  onClick,
  isSelected,
  isFavorite,
  onToggleFavorite
}: ModelCardProps) {
  // Diviser le nom complet en prénom et nom
  const [firstName, lastName] = model.name.split(' ')

  return (
    <motion.div 
      className="flex flex-col cursor-pointer relative"
      onClick={onClick}
      whileHover={{ scale: isSelected ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      <div className="rounded-xl overflow-hidden mb-1">
        <motion.div 
          className="relative aspect-square"
          animate={{ 
            boxShadow: isSelected 
              ? "0 10px 30px rgba(0, 0, 0, 0.2)" 
              : "0 0px 0px rgba(0, 0, 0, 0)" 
          }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={model.imageUrl}
            alt={model.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
          
          <motion.button 
            className="absolute top-2 right-2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e, model.id);
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 15
            }}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={isFavorite ? { 
                scale: [1, 1.2, 1],
                transition: { duration: 0.3 }
              } : {}}
            >
              <Heart 
                className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
              />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
      <div className="p-2">
        <div className="font-medium">
          {firstName} {lastName}
        </div>
        <div className="text-sm text-muted-foreground mt-0.5">
          {model.age} • {model.height} • {model.bust}/{model.waist}/{model.hips}
        </div>
      </div>
    </motion.div>
  )
} 