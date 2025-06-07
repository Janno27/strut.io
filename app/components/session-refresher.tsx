"use client";

import { useEffect } from "react";
import { useAuth } from "../context/auth-context";

export function SessionRefresher() {
  const { refreshSession } = useAuth();
  
  // Vérifier si le navigateur est basé sur Chromium (Chrome, Opera, Edge)
  const isChromiumBased = typeof window !== 'undefined' && 
    (navigator.userAgent.includes('Chrome') || 
     navigator.userAgent.includes('Opera') || 
     navigator.userAgent.includes('Edge'));
  
  useEffect(() => {
    // Si nous sommes en production et sur un navigateur Chromium, rafraîchir la session
    // quand la page est chargée ou au focus de la fenêtre
    if (isChromiumBased && process.env.NODE_ENV === 'production') {
      // Rafraîchir immédiatement lors du chargement initial
      refreshSession();
      
      // Rafraîchir lors du focus de la fenêtre (quand l'utilisateur revient sur l'onglet)
      const handleFocus = () => {
        refreshSession();
      };
      
      window.addEventListener('focus', handleFocus);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [isChromiumBased, refreshSession]);
  
  // Ce composant ne rend rien visuellement
  return null;
} 