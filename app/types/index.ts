// Types pour les mannequins
export interface Model {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'non-binary';
  dateOfBirth: string; // format ISO: "YYYY-MM-DD"
  height: number; // en centimètres
  measurements: ModelMeasurements;
  skills: string[];
  experiences: Experience[];
  photos: Photo[];
  availability: boolean;
  contactInfo: ContactInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ModelMeasurements {
  bust?: number; // en centimètres
  waist: number; // en centimètres
  hips?: number; // en centimètres
  shoeSize: number; // pointure EU
  hairColor: string;
  eyeColor: string;
  clothingSize: string; // XS, S, M, L, XL, etc.
}

export interface Experience {
  id: string;
  title: string;
  client: string;
  date: string; // format ISO: "YYYY-MM-DD"
  description: string;
}

export interface Photo {
  id: string;
  url: string;
  type: 'portrait' | 'full-body' | 'other';
  isCover: boolean;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address?: string;
}

// Types pour l'authentification et les utilisateurs
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'agent' | 'client';
  firstName: string;
  lastName: string;
}

// Types pour les événements ou castings
export interface Casting {
  id: string;
  title: string;
  client: string;
  date: string; // format ISO: "YYYY-MM-DD"
  location: string;
  description: string;
  requirements: CastingRequirements;
  selectedModels: string[]; // IDs des mannequins sélectionnés
  status: 'draft' | 'active' | 'completed' | 'cancelled';
}

export interface CastingRequirements {
  gender?: 'male' | 'female' | 'non-binary' | 'all';
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  specificSkills?: string[];
} 