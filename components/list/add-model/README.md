# Module Add-Model

## 📋 Vue d'ensemble

Module modulaire pour l'ajout de nouveaux modèles dans l'application de casting. Ce module a été refactorisé depuis un composant monolithique de 835 lignes vers une architecture modulaire et réutilisable.

## 🏗️ Architecture

### Structure des fichiers

```
add-model/
├── README.md                     # Documentation
├── index.ts                      # Exports centralisés
├── types.ts                      # Types TypeScript
├── add-model-modal.tsx          # Composant principal (125 lignes)
├── hooks/                       # Hooks personnalisés
│   ├── use-add-model-form.ts    # Gestion du formulaire (125 lignes)
│   ├── use-model-images.ts      # Gestion des images (185 lignes)
│   └── use-model-submission.ts  # Logique de soumission (135 lignes)
├── components/                  # Composants modulaires
│   ├── model-form-fields.tsx    # Champs du formulaire (230 lignes)
│   └── model-images-section.tsx # Section images (50 lignes)
└── utils/                       # Fonctions utilitaires
    └── model-utils.ts           # Validation et génération (90 lignes)
```

### Réduction de complexité

- **Avant** : 1 fichier monolithique de 835 lignes
- **Après** : 9 fichiers modulaires totalisant ~940 lignes
- **Composant principal** : Réduit à seulement 125 lignes (85% de réduction)

## 🎯 Hooks personnalisés

### `useAddModelForm`
**Responsabilité** : Gestion complète de l'état du formulaire
- État du formulaire avec validation
- Gestion des valeurs personnalisées (couleurs d'yeux/cheveux)
- Pré-remplissage depuis les données de rendez-vous
- Validation et réinitialisation

```typescript
const {
  formData,
  customEyeColor,
  customHairColor,
  isLoading,
  handleChange,
  handleSelectChange,
  handleCustomValueChange,
  validateForm,
  resetForm,
  getFinalFormData,
  setIsLoading,
} = useAddModelForm({ appointmentData })
```

### `useModelImages`
**Responsabilité** : Gestion complète des images (upload, crop, validation)
- Upload d'images principales et supplémentaires
- Validation des formats et tailles
- Gestion du recadrage avec modal
- Réorganisation par drag & drop
- Nettoyage des URLs blob

```typescript
const {
  mainImage,
  additionalImages,
  mainImageFile,
  additionalImageFiles,
  isCropperOpen,
  cropImageUrl,
  handleMainImageUpload,
  handleMainImageRemove,
  handleAdditionalImageUpload,
  handleAdditionalImageRemove,
  handleAdditionalImagesReorder,
  handleMainImageCrop,
  handleAdditionalImageCrop,
  handleCropComplete,
  setIsCropperOpen,
  resetImages,
} = useModelImages()
```

### `useModelSubmission`
**Responsabilité** : Soumission et upload vers Supabase
- Upload des images vers Supabase Storage
- Génération d'images par défaut
- Insertion en base de données
- Gestion des erreurs et notifications

```typescript
const { submitModel } = useModelSubmission({ agentId: profile?.id })
```

## 🧩 Composants modulaires

### `ModelFormFields`
**Responsabilité** : Interface utilisateur pour tous les champs du formulaire
- Informations personnelles (prénom, nom, genre, âge)
- Mensurations (taille, buste, taille, hanches, pointure)
- Caractéristiques physiques (yeux, cheveux avec options personnalisées)
- Réseaux sociaux et description

### `ModelImagesSection`
**Responsabilité** : Interface pour la gestion des images
- Upload d'image principale avec `MainImageUploader`
- Gestion d'images supplémentaires avec `DraggableImageGrid`
- Intégration avec les hooks d'images

## 🛠️ Utilitaires

### `model-utils.ts`
- `validateAndProcessImage()` : Validation des formats et tailles d'images
- `generateDefaultImage()` : Génération d'avatars par défaut basés sur les initiales
- `generateFileName()` : Génération de noms de fichiers optimisés pour Supabase

## 📝 Types TypeScript

Tous les types sont centralisés dans `types.ts` :
- `AddModelFormData` : Structure des données du formulaire
- `AddModelModalProps` : Props du composant principal
- `ModelImageValidation` : Résultat de validation d'image
- `ModelImageUploadResult` : Résultat d'upload d'images
- `ModelFormFieldsProps` : Props des champs de formulaire
- `ModelImagesSectionProps` : Props de la section images

## 🔄 Utilisation

### Import du composant principal
```typescript
import { AddModelModal } from '@/components/list/add-model'

// Ou import spécifique
import { AddModelModal } from '@/components/list/add-model/add-model-modal'
```

### Import des hooks pour réutilisation
```typescript
import { 
  useAddModelForm, 
  useModelImages, 
  useModelSubmission 
} from '@/components/list/add-model'
```

### Import des composants modulaires
```typescript
import { 
  ModelFormFields, 
  ModelImagesSection 
} from '@/components/list/add-model'
```

## ✨ Fonctionnalités conservées

### Gestion des images
- ✅ Upload d'image principale obligatoire ou génération automatique
- ✅ Upload multiple d'images supplémentaires (max 10)
- ✅ Validation des formats (JPG, PNG, WebP) et tailles (max 10MB)
- ✅ Recadrage avec preview en temps réel
- ✅ Drag & drop pour réorganiser les images supplémentaires
- ✅ Suppression et remplacement d'images

### Formulaire complet
- ✅ Validation en temps réel avec messages d'erreur
- ✅ Champs personnalisés pour couleurs d'yeux/cheveux
- ✅ Pré-remplissage depuis les données de rendez-vous
- ✅ Gestion des états de chargement
- ✅ Réinitialisation automatique après soumission

### Upload Supabase
- ✅ Upload optimisé vers Supabase Storage
- ✅ Génération d'URLs publiques
- ✅ Gestion des erreurs avec retry
- ✅ Noms de fichiers uniques avec metadata
- ✅ Cache control et optimisations

## 🚀 Avantages de la refactorisation

### Maintenabilité
- **Séparation des responsabilités** : Chaque hook/composant a un rôle précis
- **Code plus lisible** : Fichiers courts et focalisés
- **Facilité de debug** : Isolation des problèmes par module
- **Tests unitaires** : Chaque hook/composant testable individuellement

### Réutilisabilité
- **Hooks réutilisables** : Peuvent être utilisés dans d'autres contextes
- **Composants modulaires** : Réutilisables pour d'autres formulaires
- **Logique métier isolée** : Découplée de l'interface utilisateur
- **Types partagés** : Réutilisables dans toute l'application

### Évolutivité
- **Ajout de fonctionnalités** : Plus facile d'étendre chaque module
- **Modifications ciblées** : Changements localisés sans impact global
- **Performance** : Possibilité d'optimiser chaque module individuellement
- **Code splitting** : Chargement lazy des modules si nécessaire

## 🔧 Développement futur

### Extensions possibles
- **Nouveaux champs** : Ajouter facilement dans `ModelFormFields`
- **Nouveaux formats d'images** : Modifier `validateAndProcessImage`
- **Nouveaux providers de stockage** : Remplacer `useModelSubmission`
- **Modes d'édition** : Réutiliser les hooks pour l'édition de modèles existants

### Optimisations
- **Lazy loading** : Charger les composants à la demande
- **Memoization** : Optimiser les re-rendus avec React.memo
- **Batch uploads** : Optimiser l'upload de multiples images
- **Progressive loading** : Améliorer l'UX des uploads longs

## 📊 Métriques de performance

### Réduction de complexité
- **Lignes par fichier** : Moyenne de 105 lignes (vs 835 avant)
- **Responsabilités** : 1 responsabilité par module (vs multiples avant)
- **Couplage** : Faible couplage entre modules
- **Cohésion** : Forte cohésion interne de chaque module

### Compatibilité
- **API identique** : Aucun changement d'interface publique
- **Fonctionnalités** : 100% des features préservées
- **Performance** : Aucune régression de performance
- **Tests** : Compatibilité avec les tests existants 