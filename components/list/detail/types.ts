export interface FocalPoint {
  x: number  // Pourcentage 0-100
  y: number  // Pourcentage 0-100
}

export interface Model {
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
  first_name?: string
  last_name?: string
  agent_id?: string
  // Focal points pour repositionner les images dans leurs previews
  main_image_focal_point?: FocalPoint
  additional_images_focal_points?: Record<string, FocalPoint>
}

export interface ModelFormData {
  firstName: string
  lastName: string
  age: string
  height: string
  bust: string
  waist: string
  hips: string
  shoeSize: string
  eyeColor: string
  hairColor: string
  instagram: string
  modelsComLink: string
  description: string
}

export interface ModelDetailProps {
  model: Model
  onClose: () => void
  isFavorite?: boolean
  onToggleFavorite?: (e: React.MouseEvent, modelId: string) => void
  canEdit?: boolean
  onModelUpdated?: () => void
  onModelDeleted?: () => void
}

export interface ActionButtonsProps {
  isFavorite: boolean
  canEdit: boolean
  isEditing: boolean
  isDeleting: boolean
  isLoading: boolean
  onToggleFavorite?: (e: React.MouseEvent) => void
  onEdit: () => void
  onDelete: () => void
  onSave: () => void
  onCancel: () => void
  onClose: () => void
}

export interface DeleteConfirmationProps {
  isVisible: boolean
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export interface ModelInfoProps {
  model: Model
  firstName: string
  lastName: string
}

export interface ModelEditFormProps {
  formData: ModelFormData
  isLoading: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSelectChange: (value: string, name: string) => void
  // Gestion des images
  mainImage?: string | null
  additionalImages?: string[]
  mainImageFocalPoint?: FocalPoint
  additionalImagesFocalPoints?: Record<string, FocalPoint>
  onMainImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onMainImageRemove?: () => void
  onMainImageEdit?: () => void
  onMainImageReposition?: () => void
  onAdditionalImagesChange?: (images: string[]) => void
  onAdditionalImageAdd?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAdditionalImageRemove?: (index: number) => void
  onAdditionalImageReposition?: (index: number) => void
  showImageManagement?: boolean
}

export interface ImageGalleryProps {
  model: Model
  isEditing: boolean
  onImageClick: (imageUrl: string) => void
}

export interface ImageModalProps {
  imageUrl: string | null
  modelName: string
  onClose: () => void
}