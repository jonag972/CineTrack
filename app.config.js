import 'dotenv/config';

// Récupérer les variables d'environnement avec un message de diagnostic
const tmdbApiKey = process.env.TMDB_API_KEY;
const tmdbAccessToken = process.env.TMDB_ACCESS_TOKEN;
const nodeEnv = process.env.NODE_ENV || 'development';

// Afficher des informations sur les variables chargées
console.log('🌍 app.config.js - Environnement:', {
  NODE_ENV: nodeEnv,
  TMDB_API_KEY: tmdbApiKey ? '✓ présente' : '✗ manquante',
  TMDB_ACCESS_TOKEN: tmdbAccessToken ? '✓ présente' : '✗ manquante',
});

// Configuration conditionnelle en fonction de l'environnement
const easConfig = nodeEnv === 'production' 
  ? { projectId: "your-project-id" } 
  : null; // Désactive la configuration EAS en développement

// IMPORTANT: export a plain object, not an async function
export default {
  expo: {
    name: 'cinetrack',
    slug: 'cinetrack',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp', // This is required for linking
    userInterfaceStyle: 'automatic',
    newArchEnabled: true, 
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.anonymous.cinetrack'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      }
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          'image': './assets/images/splash-icon.png',
          'imageWidth': 200,
          'resizeMode': 'contain',
          'backgroundColor': '#ffffff'
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true
    },
    extra: {
      // Utiliser explicitement les variables récupérées plus haut
      tmdbApiKey,
      tmdbAccessToken,
      // Configuration EAS uniquement en production
      ...(easConfig ? { eas: easConfig } : {})
    }
  }
};

console.log('✅ app.config.js - Configuration chargée avec succès!');
