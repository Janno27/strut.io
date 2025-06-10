# Guide de Déploiement - Application Casting

## Variables d'environnement requises

### Variables Supabase (OBLIGATOIRES)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Variables de production (OBLIGATOIRES pour Render/Vercel)
```bash
# URL de votre site en production
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optionnel: domaine pour les cookies (si vous utilisez des sous-domaines)
NEXT_PUBLIC_COOKIE_DOMAIN=.your-domain.com

# Environment
NODE_ENV=production
```

## Configuration Render

### 1. Variables d'environnement
Dans le dashboard Render, ajoutez toutes les variables ci-dessus dans la section "Environment Variables".

### 2. Configuration Supabase
Dans votre dashboard Supabase, configurez :

#### URL de redirection autorisées :
- `https://your-domain.com/auth/callback`
- `http://localhost:3000/auth/callback` (pour le développement)

#### URLs du site autorisées :
- `https://your-domain.com`
- `http://localhost:3000` (pour le développement)

### 3. Configuration des cookies
Les cookies sont maintenant configurés pour être :
- `httpOnly: true` en production
- `secure: true` en production (HTTPS requis)
- `sameSite: 'lax'` pour une meilleure compatibilité
- Durée de vie : 1 semaine

## Problèmes courants et solutions

### 1. Session non maintenue après rechargement
✅ **Résolu** : Configuration améliorée des cookies et synchronisation client/serveur

### 2. Redirection infinie
✅ **Résolu** : Middleware amélioré avec gestion d'erreurs et exclusion des routes de callback

### 3. Cookies non persistants
✅ **Résolu** : Configuration correcte des cookies avec les bonnes options de sécurité

## Tests après déploiement

1. **Connexion** : Testez la connexion avec un compte existant
2. **Rafraîchissement** : Après connexion, rafraîchissez la page - vous devriez rester connecté
3. **Navigation** : Naviguez entre les pages - la session doit être maintenue
4. **Déconnexion** : Testez la déconnexion - vous devriez être redirigé vers la page de connexion
5. **Nouvelle session** : Après déconnexion, vous ne devriez plus pouvoir accéder aux pages protégées

## Logs utiles

En cas de problème, vérifiez ces logs :
- Console du navigateur pour les erreurs d'authentification
- Logs Render pour les erreurs serveur
- Dashboard Supabase > Auth > Logs pour les erreurs d'authentification

## Support

Si vous rencontrez encore des problèmes :
1. Vérifiez que toutes les variables d'environnement sont correctement définies
2. Vérifiez la configuration des URLs dans Supabase
3. Videz le cache du navigateur et les cookies
4. Testez en navigation privée 