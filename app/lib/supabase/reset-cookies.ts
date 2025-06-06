// Fonction utilitaire pour réinitialiser les cookies Supabase problématiques
export function resetSupabaseCookies() {
  if (typeof document === 'undefined') {
    return; // S'exécute uniquement côté client
  }

  // Liste des préfixes de cookies Supabase connus
  const supabaseCookiePrefixes = [
    'sb-',
    'supabase-auth-token',
    'sb-auth-token'
  ];

  // Récupérer tous les cookies
  const cookies = document.cookie.split(';');

  // Supprimer chaque cookie Supabase
  for (const cookie of cookies) {
    const [name, _] = cookie.trim().split('=');
    
    // Vérifier si c'est un cookie Supabase
    if (supabaseCookiePrefixes.some(prefix => name.startsWith(prefix))) {
      // Définir une date d'expiration passée pour supprimer le cookie
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      console.log(`Cookie supprimé: ${name}`);
    }
  }

  // Vider également le localStorage pour plus de sécurité
  if (typeof localStorage !== 'undefined') {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
        console.log(`LocalStorage supprimé: ${key}`);
      }
    }
  }
} 