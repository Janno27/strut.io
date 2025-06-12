import { useState, useEffect } from "react"
import { AddModelFormData, AddModelModalProps } from "../types"

interface UseAddModelFormProps {
  appointmentData?: AddModelModalProps['appointmentData']
}

export function useAddModelForm({ appointmentData }: UseAddModelFormProps) {
  // État pour le formulaire
  const [formData, setFormData] = useState<AddModelFormData>({
    firstName: "",
    lastName: "",
    gender: "female",
    age: "",
    height: "",
    bust: "",
    waist: "",
    hips: "",
    shoeSize: "",
    eyeColor: "",
    hairColor: "",
    instagram: "",
    modelsComLink: "",
    description: ""
  })

  // État pour les valeurs personnalisées
  const [customEyeColor, setCustomEyeColor] = useState("")
  const [customHairColor, setCustomHairColor] = useState("")
  
  // État pour le chargement
  const [isLoading, setIsLoading] = useState(false)

  // Pré-remplir le formulaire avec les données du rendez-vous si disponibles
  useEffect(() => {
    if (appointmentData?.appointment) {
      const appointment = appointmentData.appointment;
      const nameParts = appointment.model_name?.split(' ') || [];
      
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(' ') || "",
        gender: "female", // Par défaut, à ajuster si l'info est disponible
        age: "",
        height: "",
        bust: "",
        waist: "",
        hips: "",
        shoeSize: "",
        eyeColor: "",
        hairColor: "",
        instagram: appointment.model_instagram?.replace('@', '') || "",
        modelsComLink: "",
        description: appointment.notes || ""
      });
    }
  }, [appointmentData]);

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Gérer les changements de select
  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Réinitialiser les valeurs personnalisées lorsqu'une option standard est sélectionnée
    if (name === "eyeColor" && value !== "autre") {
      setCustomEyeColor("")
    }
    
    if (name === "hairColor" && value !== "autre") {
      setCustomHairColor("")
    }
  }
  
  // Gérer les changements de valeur personnalisée
  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const { value } = e.target
    
    if (fieldName === "eyeColor") {
      setCustomEyeColor(value)
    }
    
    if (fieldName === "hairColor") {
      setCustomHairColor(value)
    }
  }

  // Validation du formulaire
  const validateForm = (): { isValid: boolean; error?: string } => {
    if (!formData.firstName.trim()) {
      return { isValid: false, error: "Le prénom est obligatoire" };
    }
    return { isValid: true };
  }

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      gender: "female",
      age: "",
      height: "",
      bust: "",
      waist: "",
      hips: "",
      shoeSize: "",
      eyeColor: "",
      hairColor: "",
      instagram: "",
      modelsComLink: "",
      description: ""
    });
    setCustomEyeColor("");
    setCustomHairColor("");
  }

  // Obtenir les valeurs finales (avec les couleurs personnalisées)
  const getFinalFormData = () => {
    const finalEyeColor = formData.eyeColor === "autre" && customEyeColor.trim() ? customEyeColor : formData.eyeColor;
    const finalHairColor = formData.hairColor === "autre" && customHairColor.trim() ? customHairColor : formData.hairColor;
    
    return {
      ...formData,
      eyeColor: finalEyeColor,
      hairColor: finalHairColor
    };
  }

  return {
    // État
    formData,
    customEyeColor,
    customHairColor,
    isLoading,
    
    // Actions
    handleChange,
    handleSelectChange,
    handleCustomValueChange,
    validateForm,
    resetForm,
    getFinalFormData,
    setIsLoading,
  }
} 