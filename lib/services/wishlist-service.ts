// Service pour gérer la wishlist avec localStorage
const WISHLIST_KEY = 'casting-app-wishlist';

export interface WishlistModel {
  id: string;
  name: string;
  age: number;
  height: number;
  bust: number;
  waist: number;
  hips: number;
  imageUrl: string;
}

// Récupérer la wishlist depuis localStorage
export const getWishlist = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  const wishlistJson = localStorage.getItem(WISHLIST_KEY);
  if (!wishlistJson) return [];
  
  try {
    return JSON.parse(wishlistJson);
  } catch (e) {
    console.error('Erreur lors de la récupération de la wishlist:', e);
    return [];
  }
};

// Sauvegarder la wishlist dans localStorage
export const saveWishlist = (wishlist: string[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
};

// Ajouter un modèle à la wishlist
export const addToWishlist = (modelId: string): string[] => {
  const wishlist = getWishlist();
  if (!wishlist.includes(modelId)) {
    wishlist.push(modelId);
    saveWishlist(wishlist);
  }
  return wishlist;
};

// Supprimer un modèle de la wishlist
export const removeFromWishlist = (modelId: string): string[] => {
  const wishlist = getWishlist();
  const newWishlist = wishlist.filter(id => id !== modelId);
  saveWishlist(newWishlist);
  return newWishlist;
};

// Vérifier si un modèle est dans la wishlist
export const isInWishlist = (modelId: string): boolean => {
  const wishlist = getWishlist();
  return wishlist.includes(modelId);
};

// Toggle un modèle dans la wishlist
export const toggleWishlist = (modelId: string): string[] => {
  if (isInWishlist(modelId)) {
    return removeFromWishlist(modelId);
  } else {
    return addToWishlist(modelId);
  }
}; 