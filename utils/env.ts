// Utilitaire pour charger et gérer les variables d'environnement
import Constants from 'expo-constants';

// Afficher les clés disponibles dans Constants pour le diagnostic
console.log('🔑 Constants.expoConfig?.extra disponibles:', 
  Constants.expoConfig?.extra ? Object.keys(Constants.expoConfig.extra) : 'Aucune'
);

// Fonction qui retourne une variable d'environnement, avec possibilité de fallback
export function getEnv(key: string, fallback?: string): string | undefined {
  // Pour les clés TMDB, on cherche aussi les versions camelCase qui sont dans app.config.js
  if (key === 'TMDB_API_KEY' && Constants.expoConfig?.extra?.tmdbApiKey) {
    return String(Constants.expoConfig.extra.tmdbApiKey);
  }
  
  if (key === 'TMDB_ACCESS_TOKEN' && Constants.expoConfig?.extra?.tmdbAccessToken) {
    return String(Constants.expoConfig.extra.tmdbAccessToken);
  }
  
  // Essayer d'obtenir depuis Constants.expoConfig?.extra
  const fromExtra = Constants.expoConfig?.extra?.[key];
  if (fromExtra) return String(fromExtra);
  
  // Essayer d'obtenir depuis process.env (pour le développement local)
  if (process.env[key]) return process.env[key];
  
  // Retourner la valeur par défaut si fournie
  return fallback;
}

// Exporter les variables d'environnement importantes
export const ENV = {
  TMDB_API_KEY: getEnv('TMDB_API_KEY'),
  TMDB_ACCESS_TOKEN: getEnv('TMDB_ACCESS_TOKEN'),
};

// Fonction pour vérifier si les variables d'environnement essentielles sont définies
export function checkRequiredEnv(): boolean {
  const missingVars = Object.entries(ENV)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ Variables d'environnement manquantes: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
}

// Afficher l'état des variables d'environnement au démarrage
console.log('📊 État des variables d\'environnement:', 
  Object.entries(ENV).reduce((acc, [key, value]) => {
    acc[key] = value ? '✅ Définie' : '❌ Non définie';
    return acc;
  }, {} as Record<string, string>)
);