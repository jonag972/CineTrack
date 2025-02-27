import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

console.log("🚀 Loading tabs layout module");

export default function TabLayout() {
  console.log("🔍 TabLayout - INITIALIZING");
  
  useEffect(() => {
    console.log("🔍 TabLayout - MOUNTED");
    
    return () => {
      console.log("🔍 TabLayout - UNMOUNTED");
    };
  }, []);
  
  console.log("🔍 TabLayout - RENDERING");
  const colorScheme = useColorScheme();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(31, 31, 31, 0.9)',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingVertical: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: 'hidden',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}>
              <BlurView
                tint="dark"
                intensity={80}
                style={[StyleSheet.absoluteFill]}
              />
            </View>
          ) : null
        ),
        headerStyle: {
          backgroundColor: '#1F1F1F',
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, focused }) => {
            console.log("🔍 Rendering Home tab icon");
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />;
          },
        }}
        listeners={{
          tabPress: e => {
            console.log("🔍 TabPress - HOME tab pressed");
          },
          focus: () => {
            console.log("🔍 Tab HOME focused");
          }
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Rechercher',
          tabBarLabel: 'Rechercher',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
          ),
        }}
        listeners={{
          focus: () => {
            console.log("🔍 Tab SEARCH focused");
          }
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Collections',
          tabBarLabel: 'Collections',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'folder' : 'folder-outline'} size={24} color={color} />
          ),
        }}
        listeners={{
          focus: () => {
            console.log("🔍 Tab COLLECTIONS focused");
          }
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
        listeners={{
          focus: () => {
            console.log("🔍 Tab PROFILE focused");
          }
        }}
      />
    </Tabs>
  );
}