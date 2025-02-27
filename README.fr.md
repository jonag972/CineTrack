# CinéTrack - Votre Compagnon Cinéma 🎬

CinéTrack est un projet étudiant personnel développé avec React Native et Expo. Cette application sert de plateforme complète de gestion de films où les utilisateurs peuvent découvrir, rechercher, suivre et organiser leurs expériences cinématographiques.

## App Screenshots

<div align="center">
  <p float="left">
    <img src="https://github.com/user-attachments/assets/565137a6-efaa-4b54-99dc-84c660508e5c" width="200" />
    <img src="https://github.com/user-attachments/assets/9d511b3c-593e-4eb9-8da5-ad5a3f108116" width="200" />
    <img src="https://github.com/user-attachments/assets/8a03e547-03d5-4ee1-87d1-49e4d8219664" width="200" />
  </p>
  <p float="left">
    <img src="https://github.com/user-attachments/assets/dbe4a395-e3c0-4de8-bd33-350121d33101" width="200" />
    <img src="https://github.com/user-attachments/assets/fde500e2-f743-4581-8100-d9f3046e5c1e" width="200" />
    <img src="https://github.com/user-attachments/assets/af7af570-341d-4a6a-9367-b27321d58df3" width="200" />
  </p>
</div>

## Ce Que Fait Cette Application

CinéTrack offre une expérience complète d'exploration et de gestion de films :

- **Navigation de Films** : Découvrez les films tendance, actuellement à l'affiche et à venir avec des affiches de haute qualité et des informations essentielles en un coup d'œil
- **Fonction de Recherche** : Trouvez des films spécifiques par titre ou explorez des films par catégories de genre
- **Informations Détaillées sur les Films** : Accédez à des détails complets sur les films, notamment :
  - Synopsis et aperçu de l'intrigue
  - Informations sur le casting avec noms des personnages
  - Notes des utilisateurs et année de sortie
  - Recommandations de films similaires
- **Gestion de Collection Personnelle** :
  - Gardez une trace des films que vous avez regardés
  - Enregistrez vos films favoris pour un accès rapide
  - Créez des collections thématiques personnalisées avec descriptions
  - Ajoutez/supprimez des films à/de n'importe quelle collection
  - Gérez les détails de collection (renommer, mettre à jour la description)
- **Système de Profil Utilisateur** :
  - Créez et gérez votre compte personnel
  - Authentification sécurisée par email et mot de passe
  - Visualisez les statistiques de collection dans votre profil
  - Accédez aux paramètres et préférences de l'application
- **Interface Utilisateur Inspirée d'iOS** :
  - Navigation propre et intuitive avec structure par onglets
  - Interactions et animations à sensation native
  - Thème sombre avec effets de flou pour une expérience immersive
  - Mises en page adaptatives pour différentes tailles d'appareils

## Installation et Configuration

1. Installez les dépendances

   ```bash
   npm install
   ```

2. Démarrez l'application

   ```bash
   npx expo start
   ```

Dans la sortie du terminal, vous trouverez des options pour ouvrir l'application dans :

- Un simulateur iOS
- Un émulateur Android
- L'application Expo Go (en scannant le QR code avec votre appareil mobile)

## Documentation

### Structure du Projet

- `app/` - Écrans principaux et navigation
  - `(tabs)/` - Écrans de navigation par onglets (accueil, recherche, collections, profil)
  - `movie/` - Écrans de détails des films
  - `collections/` - Écrans de gestion des collections
  - `_layout.tsx` - Configuration de la navigation principale
- `components/` - Composants UI réutilisables
- `services/` - Intégration API pour les données de films
- `utils/` - Fonctions utilitaires
- `lib/` - Bibliothèques de fonctionnalités principales
- `assets/` - Ressources statiques comme les images

### Technologies Utilisées

- **React Native** - Framework d'applications mobiles
- **Expo** - Plateforme et outils de développement
- **TypeScript** - Sécurité de type et amélioration de l'expérience développeur
- **Expo Router** - Système de navigation basé sur les fichiers
- **AsyncStorage** - Persistance des données locales
- **Axios** - Gestion des requêtes API
- **React Native Safe Area Context** - Gestion des zones sécurisées
- **Expo BlurView** - Effets de flou natifs pour une esthétique iOS

### Construction pour la Production

#### Pour iOS

```bash
npx expo run:ios
```

#### Pour Android

```bash
npx expo run:android
```

### Contribution

N'hésitez pas à soumettre des problèmes ou des pull requests si vous avez des suggestions ou des améliorations.

### En Savoir Plus

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation React Native](https://reactnative.dev/)