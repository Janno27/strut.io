import { createClient } from '../../lib/supabase/client';
import { Model } from '../types';

// Récupérer tous les mannequins
export const getAllModels = async (): Promise<Model[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('models')
    .select('*');
  
  if (error) {
    console.error('Erreur lors de la récupération des mannequins:', error);
    throw error;
  }
  
  return data || [];
};

// Récupérer un mannequin par ID
export const getModelById = async (id: string): Promise<Model | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Erreur lors de la récupération du mannequin avec l'ID ${id}:`, error);
    throw error;
  }
  
  return data;
};

// Créer un nouveau mannequin
export const createModel = async (model: Omit<Model, 'id' | 'createdAt' | 'updatedAt'>): Promise<Model> => {
  const supabase = createClient();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('models')
    .insert({
      ...model,
      createdAt: now,
      updatedAt: now
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de la création du mannequin:', error);
    throw error;
  }
  
  return data;
};

// Mettre à jour un mannequin
export const updateModel = async (id: string, updates: Partial<Model>): Promise<Model> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('models')
    .update({
      ...updates,
      updatedAt: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Erreur lors de la mise à jour du mannequin avec l'ID ${id}:`, error);
    throw error;
  }
  
  return data;
};

// Supprimer un mannequin
export const deleteModel = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('models')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Erreur lors de la suppression du mannequin avec l'ID ${id}:`, error);
    throw error;
  }
};

// Rechercher des mannequins avec des filtres
export const searchModels = async (filters: Partial<{
  gender: 'male' | 'female' | 'non-binary';
  ageMin: number;
  ageMax: number;
  heightMin: number;
  heightMax: number;
  skills: string[];
  availability: boolean;
}>): Promise<Model[]> => {
  const supabase = createClient();
  let query = supabase.from('models').select('*');
  
  // Appliquer les filtres
  if (filters.gender) {
    query = query.eq('gender', filters.gender);
  }
  
  if (filters.heightMin) {
    query = query.gte('height', filters.heightMin);
  }
  
  if (filters.heightMax) {
    query = query.lte('height', filters.heightMax);
  }
  
  if (filters.availability !== undefined) {
    query = query.eq('availability', filters.availability);
  }
  
  // Pour les filtres d'âge, il faudrait calculer les dates de naissance correspondantes
  // Mais cela dépend de la façon dont l'âge est stocké dans la base de données
  
  // Pour les compétences, si nous voulons une correspondance partielle
  if (filters.skills && filters.skills.length > 0) {
    // Supposons que les compétences sont stockées dans un array
    query = query.contains('skills', filters.skills);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erreur lors de la recherche de mannequins:', error);
    throw error;
  }
  
  return data || [];
};

// Télécharger une photo de mannequin
export const uploadModelPhoto = async (modelId: string, file: File, type: 'portrait' | 'full-body' | 'other'): Promise<string> => {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${modelId}/${Date.now()}.${fileExt}`;
  const filePath = `models/${fileName}`;
  
  const { error } = await supabase.storage
    .from('photos')
    .upload(filePath, file);
  
  if (error) {
    console.error('Erreur lors du téléchargement de la photo:', error);
    throw error;
  }
  
  // Récupérer l'URL publique de la photo
  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(filePath);
  
  // Mettre à jour le mannequin avec la nouvelle photo
  // D'abord, récupérer les photos actuelles
  const { data: modelData, error: fetchError } = await supabase
    .from('models')
    .select('photos')
    .eq('id', modelId)
    .single();
  
  if (fetchError) {
    console.error(`Erreur lors de la récupération des photos du mannequin avec l'ID ${modelId}:`, fetchError);
    throw fetchError;
  }
  
  // Ajouter la nouvelle photo
  const updatedPhotos = [
    ...(modelData.photos || []),
    {
      id: fileName,
      url: data.publicUrl,
      type,
      isCover: false
    }
  ];
  
  // Mettre à jour le mannequin
  const { error: updateError } = await supabase
    .from('models')
    .update({
      photos: updatedPhotos,
      updatedAt: new Date().toISOString()
    })
    .eq('id', modelId);
  
  if (updateError) {
    console.error(`Erreur lors de la mise à jour des photos du mannequin avec l'ID ${modelId}:`, updateError);
    throw updateError;
  }
  
  return data.publicUrl;
}; 