import React, { useEffect } from 'react';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import * as SplashScreen from 'expo-splash-screen';
import { LogBox } from "react-native";

// Prevent auto-hide of splash screen
SplashScreen.preventAutoHideAsync().catch(console.warn);

// Ignore warnings that might clutter logs
LogBox.ignoreLogs([
  'Warning: ...',
  'Sending `onAnimatedValueUpdate`',
]);

console.log("🚀 Root layout loading");

export default function RootLayout() {
  useEffect(() => {
    console.log("🔍 Root layout mounted");
    
    // Hide splash screen after a delay
    const hideSplash = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        await SplashScreen.hideAsync();
        console.log("🔍 Splash screen hidden");
      } catch (e) {
        console.log("🔍 Error hiding splash screen:", e);
      }
    };
    
    hideSplash();
    
    return () => {
      console.log("🔍 Root layout unmounted");
    };
  }, []);
  
  console.log("🔍 Root layout rendering");
  
  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000000" },
        animation: "fade",
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="test" />
        <Stack.Screen name="movie/[id]" />
        <Stack.Screen name="collections/[slug]" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="reset-password" />
      </Stack>
    </ThemeProvider>
  );
}
