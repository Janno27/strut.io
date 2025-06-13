// Composant principal
export { ModelDetail } from './model-detail'

// Hooks personnalisés
export { useModelDetail } from './hooks/use-model-detail'
export { useImageManagement } from './hooks/use-image-management'
export { useModelSave } from './hooks/use-model-save'

// Composants modulaires
export { ModelMainImage } from './components/model-main-image'
export { ModelAdditionalImages } from './components/model-additional-images'
export { ModelImageModal } from './components/model-image-modal'
export { ImagePositionEditor } from './components/image-position-editor'

// Types
export type { ModelDetailProps, ModelFormData } from './types'

// Sous-composants
export { ActionButtons } from "./action-buttons"
export { DeleteConfirmation } from "./delete-confirmation"
export { ModelInfo } from "./model-info"
export { ModelEditForm } from "./model-edit-form"
export { ImageGallery } from "./image-gallery"
export { ImageModal } from "./image-modal"

// Types et interfaces
export type * from "./types"