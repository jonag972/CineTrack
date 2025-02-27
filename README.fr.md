# Bienvenue sur votre application CinéTrack 👋

Ceci est un projet [Expo](https://expo.dev) créé avec [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Pour commencer

1. Installez les dépendances

   ```bash
   npm install
   ```

2. Démarrez l'application

   ```bash
   npx expo start
   ```

Dans la sortie du terminal, vous trouverez des options pour ouvrir l'application dans :

- Un [build de développement](https://docs.expo.dev/develop/development-builds/introduction/)
- Un [émulateur Android](https://docs.expo.dev/workflow/android-studio-emulator/)
- Un [simulateur iOS](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), un environnement limité pour tester le développement d'applications avec Expo

Vous pouvez commencer à développer en modifiant les fichiers dans le répertoire **app**. Ce projet utilise le [routage basé sur les fichiers](https://docs.expo.dev/router/introduction).

## Structure du Projet

Le projet est organisé comme suit :

- `app/` : Contient les écrans et la logique de navigation
  - `(tabs)/` : Configuration des onglets de navigation
  - `_layout.tsx` : Configuration générale de la navigation
- `assets/` : Ressources statiques (images, polices)
- `components/` : Composants réutilisables
- `hooks/` : Hooks personnalisés

## Fonctionnalités Principales

L'application dispose actuellement de quatre onglets principaux :

1. **Accueil** : Page d'accueil principale
2. **Rechercher** : Fonction de recherche de films
3. **Ma Liste** : Liste personnelle de films à regarder
4. **Profil** : Gestion du profil utilisateur

## Technologies Utilisées

- React Native avec Expo
- TypeScript pour un typage statique
- Expo Router pour la navigation
- Diverses bibliothèques Expo pour les fonctionnalités natives

## En savoir plus

Pour en apprendre davantage sur le développement avec Expo, consultez les ressources suivantes :

- [Documentation Expo](https://docs.expo.dev/) : Apprenez les fondamentaux ou explorez des sujets avancés
- [Tutoriel Expo](https://docs.expo.dev/tutorial/introduction/) : Suivez un tutoriel pas à pas
- [Communauté Discord](https://chat.expo.dev) : Rejoignez la communauté des développeurs Expo