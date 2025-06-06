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