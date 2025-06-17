import { ImageGroups } from "@/components/list/detail/types"

/**
 * Récupère l'image principale automatiquement depuis les groupes d'images
 * Utilise la première image du premier groupe (ungrouped en priorité, sinon le premier groupe nommé)
 */
export function getMainImageFromGroups(
  imageGroups?: ImageGroups,
  additionalImages?: string[]
): string | null {
  // Si on a des groupes d'images
  if (imageGroups) {
    // Priorité 1: Images non groupées
    if (imageGroups.ungrouped && Array.isArray(imageGroups.ungrouped) && imageGroups.ungrouped.length > 0) {
      return imageGroups.ungrouped[0]
    }
    
    // Priorité 2: Premier groupe nommé
    const groupKeys = Object.keys(imageGroups).filter(key => key !== 'ungrouped')
    for (const groupKey of groupKeys) {
      const group = imageGroups[groupKey]
      if (group && !Array.isArray(group) && group.images && group.images.length > 0) {
        return group.images[0]
      }
    }
  }
  
  // Fallback: Première image des images supplémentaires (ancien système)
  if (additionalImages && additionalImages.length > 0) {
    return additionalImages[0]
  }
  
  return null
}

/**
 * Récupère toutes les images disponibles (pour la galerie)
 * Exclut l'image principale pour éviter les doublons
 */
export function getAllImagesExceptMain(
  imageGroups?: ImageGroups,
  additionalImages?: string[]
): string[] {
  const mainImage = getMainImageFromGroups(imageGroups, additionalImages)
  const allImages: string[] = []
  
  // Récupérer toutes les images des groupes
  if (imageGroups) {
    // Images non groupées
    if (imageGroups.ungrouped && Array.isArray(imageGroups.ungrouped)) {
      allImages.push(...imageGroups.ungrouped)
    }
    
    // Images des groupes nommés
    Object.keys(imageGroups).forEach(key => {
      if (key !== 'ungrouped') {
        const group = imageGroups[key]
        if (group && !Array.isArray(group) && group.images) {
          allImages.push(...group.images)
        }
      }
    })
  }
  
  // Fallback: Images supplémentaires (ancien système)
  if (additionalImages) {
    allImages.push(...additionalImages)
  }
  
  // Filtrer l'image principale pour éviter les doublons
  return allImages.filter(img => img !== mainImage)
}

/**
 * Vérifie si un modèle a au moins une image
 */
export function hasImages(
  imageGroups?: ImageGroups,
  additionalImages?: string[]
): boolean {
  return getMainImageFromGroups(imageGroups, additionalImages) !== null
}

/**
 * Compte le nombre total d'images
 */
export function getTotalImageCount(
  imageGroups?: ImageGroups,
  additionalImages?: string[]
): number {
  let count = 0
  
  if (imageGroups) {
    // Images non groupées
    if (imageGroups.ungrouped && Array.isArray(imageGroups.ungrouped)) {
      count += imageGroups.ungrouped.length
    }
    
    // Images des groupes nommés
    Object.keys(imageGroups).forEach(key => {
      if (key !== 'ungrouped') {
        const group = imageGroups[key]
        if (group && !Array.isArray(group) && group.images) {
          count += group.images.length
        }
      }
    })
  }
  
  // Fallback: Images supplémentaires (ancien système)
  if (additionalImages) {
    count += additionalImages.length
  }
  
  return count
} 