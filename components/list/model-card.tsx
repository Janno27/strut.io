"use client"

import { motion } from "framer-motion"
import { Heart, Star, ToggleLeft, ToggleRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getMainImageFromGroups, getMainImageFocalPoint } from "@/lib/utils/image-utils"
import { ImageGroups } from "@/components/list/detail/types"
import { useUnitToggle } from "@/hooks/use-unit-toggle"

interface ModelCardProps {
  model: {
    id: string
    name: string
    age?: number | null
    height: number
    bust: number
    waist: number
    hips: number
    imageUrl?: string | null // Garde pour compatibilité, mais ne sera plus utilisé
    additionalImages?: string[]
    additional_images_focal_points?: Record<string, { x: number; y: number }>
    image_groups?: ImageGroups
    is_shortlisted?: boolean
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
  const { unit, toggleUnit, formatMeasurement, formatMeasurementSimple } = useUnitToggle()
  
  // Diviser le nom complet en prénom et nom
  const [firstName, lastName] = model.name.split(' ')

  // Récupérer l'image principale automatiquement depuis les groupes
  const mainImageUrl = getMainImageFromGroups(model.image_groups, model.additionalImages) || model.imageUrl || ""
  
  // Récupérer le focal point de l'image principale
  const mainImageFocalPoint = getMainImageFocalPoint(
    model.image_groups, 
    model.additionalImages, 
    model.additional_images_focal_points
  )
  
  // Calculer la position de l'objet pour le CSS
  const objectPosition = mainImageFocalPoint 
    ? `${mainImageFocalPoint.x}% ${mainImageFocalPoint.y}%` 
    : 'center'

  // Construire l'affichage des informations (conditions d'affichage)
  const ageDisplay = (model.age && model.age > 0) ? `${model.age} • ` : ""
  const heightDisplay = model.height && model.height > 0 ? `${model.height} • ` : ""
  const hasMeasurements = model.bust && model.waist && model.hips
  const measurementsDisplay = hasMeasurements ? `${model.bust}/${model.waist}/${model.hips}` : ""

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
          <OptimizedImage
            src={mainImageUrl}
            alt={model.name}
            fill
            className="object-cover"
            objectPosition={objectPosition}
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
            cacheWidth={400}
            cacheHeight={400}
            cacheQuality={80}
          />
          
          {/* Badge Shortlist */}
          {model.is_shortlisted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 left-2 z-10"
            >
              <Badge 
                variant="default" 
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 font-medium text-xs px-2 py-1 shadow-lg"
              >
                <Star className="w-3 h-3 mr-1 fill-current" />
                Shortlist
              </Badge>
            </motion.div>
          )}

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
        <TooltipProvider>
          <Tooltip>
                         <TooltipTrigger asChild>
               <div className="text-sm text-muted-foreground mt-0.5 cursor-help">
                 {ageDisplay}{heightDisplay}{measurementsDisplay}
               </div>
             </TooltipTrigger>
                         <TooltipContent>
               <div className="space-y-1">
                 {(model.age && model.age > 0) && <p>Âge: {model.age} ans</p>}
                 {model.height && model.height > 0 && <p>Taille: {formatMeasurement(model.height, true)}</p>}
                 {hasMeasurements && (
                   <>
                     <div className="flex items-center gap-2">
                       <span>Mensurations ({unit === 'cm' ? 'cm' : 'pouces'}):</span>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           toggleUnit();
                         }}
                         className="flex items-center text-xs hover:text-foreground transition-colors"
                         title={`Basculer vers ${unit === 'cm' ? 'pouces' : 'cm'}`}
                       >
                         {unit === 'cm' ? (
                           <ToggleLeft className="w-3 h-3" />
                         ) : (
                           <ToggleRight className="w-3 h-3" />
                         )}
                       </button>
                     </div>
                     <p>Buste: {formatMeasurement(model.bust)}</p>
                     <p>Taille: {formatMeasurement(model.waist)}</p>
                     <p>Hanches: {formatMeasurement(model.hips)}</p>
                   </>
                 )}
               </div>
             </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  )
} 