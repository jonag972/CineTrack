import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { getCurrentUser } from "@/utils/auth";
import { View, Text, LogBox } from "react-native";
import * as SplashScreen from 'expo-splash-screen';

// Prévenir le masquage automatique du splash screen
SplashScreen.preventAutoHideAsync();

console.log("🚀 Loading root layout");

LogBox.ignoreLogs(['Warning: ...']); // Ignorer certains logs si nécessaire

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  
  console.log("🔍 RootLayout - INITIALIZING");
  console.log("🔍 Current segments:", segments);
  
  useEffect(() => {
    console.log("🔍 RootLayout mounted");

    // Masquer le splash screen après un court délai
    const hideSplash = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await SplashScreen.hideAsync();
      console.log("🔍 Splash screen hidden");
    };
    
    hideSplash();

    return () => {
      console.log("🔍 RootLayout unmounted");
    };
  }, []);
  
  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 checkAuth - Running auth check, segments:", segments);
      try {
        const user = await getCurrentUser();
        console.log("🔍 User state:", user ? "Logged in" : "Not logged in");
        
        const inAuthGroup = segments[0] === "(auth)";
        const inProtectedRoute = segments[0] === "(tabs)" && (segments[1] === "watchlist");
        
        console.log("🔍 Route info - inAuthGroup:", inAuthGroup, "inProtectedRoute:", inProtectedRoute);
  
        if (!user && inProtectedRoute) {
          console.log("🔍 REDIRECTING to /login (protected route with no user)");
          router.replace("/login");
        }
      } catch (error) {
        console.error("🔍 Error during auth check:", error);
      }
    };
    
    if (segments.length > 0) {
      checkAuth();
    }
  }, [segments]);
  
  console.log("🔍 RootLayout - RENDERING Stack");

  // On peut tester les segments ici avant de rendre
  if (segments.length === 0) {
    console.log("🔍 No segments found, navigation may be initializing...");
  }
  
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
          animation: "fade",
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ title: "Home" }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="movie/[id]" 
          options={{ title: "Movie Details" }} 
        />
        <Stack.Screen 
          name="collections/[slug]" 
          options={{ title: "Collection" }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ title: "Login" }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ title: "Register" }} 
        />
        <Stack.Screen 
          name="reset-password" 
          options={{ title: "Reset Password" }} 
        />
      </Stack>
    </ThemeProvider>
  );
}
