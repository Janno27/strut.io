import { SlotWithAppointment } from "@/lib/types/agenda"

export interface FocalPoint {
  x: number
  y: number
}

export interface AddModelFormData {
  firstName: string
  lastName: string
  gender: string
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

export interface AddModelModalProps {
  isOpen: boolean
  onClose: () => void
  onModelAdded?: () => void
  appointmentData?: SlotWithAppointment
}

export interface ModelImageValidation {
  isValid: boolean
  error?: string
}

export interface ModelImageUploadResult {
  mainImageUrl: string
  additionalImageUrls: string[]
}

export interface ModelFormFieldsProps {
  formData: AddModelFormData
  customEyeColor: string
  customHairColor: string
  isLoading: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSelectChange: (value: string, name: string) => void
  onCustomValueChange: (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => void
  books?: any[]
  onAddBook?: (name: string, url: string) => boolean
  onRemoveBook?: (bookId: string) => void
  onUpdateBook?: (bookId: string, name: string, url: string) => boolean
}

export interface ModelImagesSectionProps {
  mainImage: string | null
  additionalImages: string[]
  mainImageFocalPoint?: FocalPoint
  additionalImagesFocalPoints: Record<string, FocalPoint>
  isLoading: boolean
  onMainImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onMainImageRemove: () => void
  onMainImageReposition: () => void
  onAdditionalImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAdditionalImageRemove: (index: number) => void
  onAdditionalImagesReorder: (newImages: string[]) => void
  onAdditionalImageReposition: (index: number) => void
} 