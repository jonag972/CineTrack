// filepath: /Users/jonag972/Library/Mobile Documents/com~apple~CloudDocs/Projets/CinéTrack/cinetrack/app/index.tsx
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

// Ignorer les avertissements non critiques qui peuvent provoquer du bruit dans les logs
LogBox.ignoreLogs(['Sending']);

console.log("🔍 ROOT Index - Module loaded");

export default function Index() {
  console.log("🔍 ROOT Index - Component rendering");
  
  useEffect(() => {
    console.log("🔍 ROOT Index - MOUNTED");
    
    return () => {
      console.log("🔍 ROOT Index - UNMOUNTED");
    };
  }, []);
  
  console.log("🔍 ROOT Index - REDIRECTING to (tabs)");
  
  // Nous utilisons un lien direct vers (tabs) sans le slash pour éviter une double redirection
  return <Redirect href="(tabs)" />;
}