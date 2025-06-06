# Application de Gestion de Mannequins

Une application moderne pour la gestion de mannequins, permettant aux agences de gérer leur catalogue de mannequins et aux clients de parcourir et sélectionner des mannequins pour leurs projets.

## Technologies Utilisées

- **Frontend**: Next.js, React, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (Auth, Storage, Database)
- **Langages**: TypeScript

## Structure du Projet

```
casting-app/
├── app/
│   ├── (routes)/              # Routes de l'application
│   │   ├── (auth)/            # Pages d'authentification
│   │   ├── dashboard/         # Tableau de bord utilisateur
│   │   ├── models/            # Pages de gestion des mannequins
│   │   └── admin/             # Pages d'administration
│   ├── components/            # Composants réutilisables
│   │   ├── ui/                # Composants UI génériques (Shadcn)
│   │   ├── models/            # Composants spécifiques aux mannequins
│   │   └── layout/            # Composants de mise en page
│   ├── lib/                   # Bibliothèques et utilitaires
│   │   └── supabase/          # Configuration Supabase
│   ├── services/              # Services pour interagir avec l'API
│   ├── hooks/                 # Hooks React personnalisés
│   ├── types/                 # Définitions des types TypeScript
│   ├── context/               # Contextes React
│   └── utils/                 # Fonctions utilitaires
```

## Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

Vous pouvez trouver ces valeurs dans les paramètres de votre projet Supabase, dans la section "API".

### Base de données

Pour configurer la base de données Supabase, exécutez le script SQL suivant dans l'éditeur SQL de Supabase :

```sql
-- Voir le fichier app/sql/create_users_table.sql
```

## Développement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Authentification

L'application utilise Supabase Auth pour l'authentification. Les rôles disponibles sont :

- `admin` : Administrateur avec accès complet
- `agent` : Agent de casting
- `model` : Mannequin
- `client` : Client (par défaut, ne nécessite pas de connexion)

Seuls les rôles admin, agent et model nécessitent une connexion pour accéder à des fonctionnalités spécifiques.

## Fonctionnalités

- Authentification (connexion, inscription, récupération de mot de passe)
- Gestion des mannequins (ajout, modification, suppression)
- Recherche et filtrage avancés
- Gestion des castings et événements
- Tableau de bord pour les utilisateurs
- Zone d'administration

## Licence

[Licence à définir]
