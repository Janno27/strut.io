"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, X } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/app/context/auth-context"
import { createClient } from "@/app/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface AddModelModalProps {
  isOpen: boolean
  onClose: () => void
  onModelAdded?: () => void
}

export function AddModelModal({ isOpen, onClose, onModelAdded }: AddModelModalProps) {
  // Supabase client
  const supabase = createClient()
  const { profile } = useAuth()
  const { toast } = useToast()

  // État pour les images
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  
  // État pour le chargement
  const [isLoading, setIsLoading] = useState(false)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  
  // État pour les valeurs personnalisées
  const [customEyeColor, setCustomEyeColor] = useState("")
  const [customHairColor, setCustomHairColor] = useState("")
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
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
      // On ne modifie pas la valeur du select, seulement la valeur personnalisée
      // La valeur du formData.eyeColor reste "autre"
    }
    
    if (fieldName === "hairColor") {
      setCustomHairColor(value)
      // On ne modifie pas la valeur du select, seulement la valeur personnalisée
      // La valeur du formData.hairColor reste "autre"
    }
  }

  // Télécharger l'image principale
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainImageFile(file)
      const imageUrl = URL.createObjectURL(file)
      setMainImage(imageUrl)
    }
  }

  // Télécharger des images supplémentaires (multiple)
  const handleAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Convertir FileList en Array pour pouvoir itérer dessus
      const filesArray = Array.from(files)
      
      // Ajouter les nouveaux fichiers à la liste existante
      const newFiles = [...additionalImageFiles, ...filesArray]
      setAdditionalImageFiles(newFiles)
      
      // Créer les URLs pour l'aperçu
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file))
      setAdditionalImages(prev => [...prev, ...newImageUrls])
      
      // Réinitialiser l'input de fichier pour permettre de sélectionner les mêmes fichiers à nouveau si nécessaire
      e.target.value = ""
    }
  }

  // Supprimer une image supplémentaire
  const removeAdditionalImage = (index: number) => {
    // Libérer l'URL de l'objet pour éviter les fuites de mémoire
    URL.revokeObjectURL(additionalImages[index])
    
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Télécharger les images sur Supabase Storage et récupérer les URLs publiques
  const uploadImagesToStorage = async () => {
    try {
      // Télécharger l'image principale
      let mainImageUrl = "";
      if (mainImageFile) {
        const fileExt = mainImageFile.name.split('.').pop();
        const fileName = `${Date.now()}_main.${fileExt}`;
        const filePath = fileName;
        
        console.log("Tentative d'upload:", { 
          bucket: 'models', 
          path: filePath, 
          userId: profile?.id,
          role: profile?.role
        });
        
        // Vérifier si le bucket existe
        const { data: buckets } = await supabase.storage.listBuckets();
        console.log("Buckets disponibles:", buckets);
        
        // Upload avec gestion d'erreur détaillée
        const uploadResult = await supabase.storage
          .from('models')
          .upload(filePath, mainImageFile, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadResult.error) {
          console.error("Erreur détaillée d'upload:", uploadResult.error);
          throw new Error(`Erreur lors du téléchargement de l'image principale: ${uploadResult.error.message}`);
        }

        // Récupérer l'URL publique
        const { data: mainImageData } = supabase.storage.from('models').getPublicUrl(filePath);
        if (!mainImageData) {
          throw new Error("Impossible d'obtenir l'URL publique de l'image principale");
        }
        mainImageUrl = mainImageData.publicUrl;
        console.log("URL de l'image principale:", mainImageUrl);
      } else {
        throw new Error("Aucune image principale n'a été sélectionnée");
      }

      // Télécharger les images supplémentaires
      const additionalImageUrls: string[] = [];
      for (let i = 0; i < additionalImageFiles.length; i++) {
        const file = additionalImageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${i}.${fileExt}`;
        const filePath = fileName;
        
        const uploadResult = await supabase.storage
          .from('models')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadResult.error) {
          console.error("Erreur d'upload image supplémentaire:", uploadResult.error);
          throw new Error(`Erreur lors du téléchargement de l'image supplémentaire: ${uploadResult.error.message}`);
        }

        // Récupérer l'URL publique
        const { data: additionalImageData } = supabase.storage.from('models').getPublicUrl(filePath);
        if (additionalImageData) {
          additionalImageUrls.push(additionalImageData.publicUrl);
        }
      }

      return { mainImageUrl, additionalImageUrls };
    } catch (error) {
      console.error("Erreur dans uploadImagesToStorage:", error);
      throw error;
    }
  }

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !profile.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter un modèle",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Télécharger les images
      const { mainImageUrl, additionalImageUrls } = await uploadImagesToStorage();
      console.log("Images téléchargées avec succès:", { mainImageUrl, additionalImageUrls });
      
      // Préparer les données du modèle avec les valeurs personnalisées si nécessaire
      const finalEyeColor = formData.eyeColor === "autre" && customEyeColor.trim() ? customEyeColor : formData.eyeColor;
      const finalHairColor = formData.hairColor === "autre" && customHairColor.trim() ? customHairColor : formData.hairColor;
      
      // Préparer les données du modèle
      const modelData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        gender: formData.gender,
        age: parseInt(formData.age) || null,
        height: parseInt(formData.height) || null,
        bust: parseInt(formData.bust) || null,
        waist: parseInt(formData.waist) || null,
        hips: parseInt(formData.hips) || null,
        shoe_size: parseFloat(formData.shoeSize) || null,
        eye_color: finalEyeColor || null,
        hair_color: finalHairColor || null,
        instagram: formData.instagram || null,
        models_com_link: formData.modelsComLink || null,
        description: formData.description || null,
        main_image: mainImageUrl,
        additional_images: additionalImageUrls,
        agent_id: profile.id
      };
      
      console.log("Données du modèle à insérer:", modelData);
      
      // Insérer les données dans la table models
      const insertResult = await supabase
        .from('models')
        .insert([modelData]);
      
      if (insertResult.error) {
        console.error("Erreur d'insertion dans la base de données:", insertResult.error);
        throw insertResult.error;
      }
      
      console.log("Modèle ajouté avec succès:", insertResult);
      
      toast({
        title: "Succès",
        description: "Le modèle a été ajouté avec succès",
      });
      
      // Réinitialiser le formulaire et fermer la modale
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
      setMainImage(null);
      setAdditionalImages([]);
      setMainImageFile(null);
      setAdditionalImageFiles([]);
      
      // Notifier le parent que le modèle a été ajouté
      if (onModelAdded) {
        onModelAdded();
      }
      
      onClose();
      
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du modèle:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout du modèle",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau modèle</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire ci-dessous pour ajouter un nouveau modèle à votre catalogue.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Image principale */}
            <div className="space-y-2">
              <Label>Photo principale</Label>
              <div className="border rounded-lg p-2 h-80 flex flex-col items-center justify-center relative">
                {mainImage ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={mainImage}
                      alt="Photo principale"
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setMainImage(null)
                        setMainImageFile(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="h-10 w-10 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Cliquez pour télécharger une photo</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleMainImageUpload}
                    />
                  </>
                )}
              </div>
            </div>
            
            {/* Informations personnelles */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Genre</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange(value, "gender")}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Sélectionnez le genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="male">Homme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Âge</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Taille (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bust">Buste (cm)</Label>
                  <Input
                    id="bust"
                    name="bust"
                    type="number"
                    value={formData.bust}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waist">Tour de taille (cm)</Label>
                  <Input
                    id="waist"
                    name="waist"
                    type="number"
                    value={formData.waist}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hips">Hanches (cm)</Label>
                  <Input
                    id="hips"
                    name="hips"
                    type="number"
                    value={formData.hips}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shoeSize">Pointure</Label>
                  <Input
                    id="shoeSize"
                    name="shoeSize"
                    type="number"
                    step="0.5"
                    value={formData.shoeSize}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eyeColor">Couleur des yeux</Label>
                  <Select
                    value={formData.eyeColor}
                    onValueChange={(value) => handleSelectChange(value, "eyeColor")}
                  >
                    <SelectTrigger id="eyeColor" className="w-full">
                      <SelectValue placeholder="Sélectionnez une couleur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bleu">Bleu</SelectItem>
                      <SelectItem value="vert">Vert</SelectItem>
                      <SelectItem value="marron">Marron</SelectItem>
                      <SelectItem value="noisette">Noisette</SelectItem>
                      <SelectItem value="noir">Noir</SelectItem>
                      <SelectItem value="gris">Gris</SelectItem>
                      <SelectItem value="autre">Autre (préciser)</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.eyeColor === "autre" && (
                    <div className="mt-2">
                      <Input
                        placeholder="Précisez la couleur des yeux"
                        value={customEyeColor}
                        onChange={(e) => handleCustomValueChange(e, "eyeColor")}
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hairColor">Couleur des cheveux</Label>
                  <Select
                    value={formData.hairColor}
                    onValueChange={(value) => handleSelectChange(value, "hairColor")}
                  >
                    <SelectTrigger id="hairColor" className="w-full">
                      <SelectValue placeholder="Sélectionnez une couleur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blond">Blond</SelectItem>
                      <SelectItem value="brun">Brun</SelectItem>
                      <SelectItem value="châtain">Châtain</SelectItem>
                      <SelectItem value="roux">Roux</SelectItem>
                      <SelectItem value="noir">Noir</SelectItem>
                      <SelectItem value="gris">Gris/Blanc</SelectItem>
                      <SelectItem value="autre">Autre (préciser)</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.hairColor === "autre" && (
                    <div className="mt-2">
                      <Input
                        placeholder="Précisez la couleur des cheveux"
                        value={customHairColor}
                        onChange={(e) => handleCustomValueChange(e, "hairColor")}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    placeholder="@username"
                    value={formData.instagram}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modelsComLink">Models.com</Label>
                  <Input
                    id="modelsComLink"
                    name="modelsComLink"
                    placeholder="https://models.com/..."
                    value={formData.modelsComLink}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ajoutez une description du modèle (parcours, expérience, style...)"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Images supplémentaires */}
            <div className="md:col-span-3 space-y-2">
              <Label>Photos supplémentaires</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {additionalImages.map((image, index) => (
                  <div key={index} className="relative h-40 border rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`Photo supplémentaire ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 20vw"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeAdditionalImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="relative h-40 border rounded-lg flex flex-col items-center justify-center cursor-pointer">
                  <Plus className="h-8 w-8 mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Ajouter plusieurs photos</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleAdditionalImageUpload}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Chargement..." : "Ajouter le modèle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 