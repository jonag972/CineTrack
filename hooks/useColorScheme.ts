import { useColorScheme as useNativeColorScheme } from 'react-native';

export function useColorScheme() {
  const colorScheme = useNativeColorScheme();
  // Forcer le mode sombre pour l'application
  return 'dark';
}