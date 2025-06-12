import { ModelImageValidation, AddModelFormData } from "../types"

// Fonction pour valider et optimiser les images
export const validateAndProcessImage = (file: File): ModelImageValidation => {
  // Vérifier la taille (max 10MB pour préserver la qualité)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: "L'image ne doit pas dépasser 10MB" };
  }
  
  // Vérifier le type de fichier
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: "Format d'image non supporté. Utilisez JPG, PNG ou WebP." };
  }
  
  return { isValid: true };
};

// Générer une image par défaut basée sur les initiales et le genre
export const generateDefaultImage = async (formData: AddModelFormData): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Impossible de créer le canvas');
  
  // Générer la couleur basée sur le prénom
  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      ['#60A5FA', '#2563EB'], // blue
      ['#A78BFA', '#7C3AED'], // purple
      ['#F472B6', '#EC4899'], // pink
      ['#4ADE80', '#16A34A'], // green
      ['#FBBF24', '#F59E0B'], // yellow/orange
      ['#818CF8', '#4F46E5'], // indigo
      ['#F87171', '#DC2626'], // red
      ['#2DD4BF', '#0D9488'], // teal
      ['#22D3EE', '#0891B2'], // cyan
      ['#34D399', '#059669']  // emerald
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  const [color1, color2] = getColorFromName(formData.firstName);
  
  // Créer le dégradé
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  
  // Remplir le fond
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Ajouter les initiales
  const initials = `${formData.firstName[0] || ''}${formData.lastName[0] || ''}`.toUpperCase();
  ctx.fillStyle = 'white';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, canvas.width / 2, canvas.height / 2);
  
  // Ajouter le badge genre
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(canvas.width - 60, 10, 50, 30);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(formData.gender === 'male' ? 'H' : 'F', canvas.width - 35, 25);
  
  return canvas.toDataURL('image/png');
};

// Générer un nom de fichier optimisé
export const generateFileName = (originalName: string, type: 'main' | 'additional', agentId?: string, index?: number): string => {
  const fileExt = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const agentPrefix = agentId?.substring(0, 8) || 'unknown';
  
  if (type === 'main') {
    return `${agentPrefix}/${timestamp}_main_${randomSuffix}.${fileExt}`;
  } else {
    return `${agentPrefix}/${timestamp}_${index}_${randomSuffix}.${fileExt}`;
  }
}; 