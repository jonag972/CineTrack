import { StyleSheet, View, TouchableOpacity, Image, ScrollView, Switch, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getCurrentUser, logoutUser } from '@/utils/auth';
import { getAllCollections, Collection } from '../../lib/collections';
import { BlurView } from 'expo-blur';

console.log("🚀 Loading Profile screen");

// Component to display user's collections
const CollectionSection = ({ collections }: { collections: Collection[] }) => (
  <View style={styles.section}>
    <ThemedText style={styles.sectionTitle}>Mes Collections</ThemedText>
    <View style={styles.menuContainer}>
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => router.push(`/collections/watched`)}
      >
        <Ionicons name="eye-outline" size={22} color="#FFFFFF" />
        <ThemedText style={styles.menuItemText}>Films vus</ThemedText>
        <ThemedText style={styles.collectionCount}>
          {collections.find(c => c.id === 'watched')?.items.length || 0}
        </ThemedText>
        <Ionicons name="chevron-forward" size={22} color="#8E8E93" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.menuItem, styles.borderTop]}
        onPress={() => router.push(`/collections/favorites`)}
      >
        <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
        <ThemedText style={styles.menuItemText}>Favoris</ThemedText>
        <ThemedText style={styles.collectionCount}>
          {collections.find(c => c.id === 'favorites')?.items.length || 0}
        </ThemedText>
        <Ionicons name="chevron-forward" size={22} color="#8E8E93" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.menuItem, styles.borderTop]}
        onPress={() => router.replace('/(tabs)/collections')}
      >
        <Ionicons name="folder-outline" size={22} color="#FFFFFF" />
        <ThemedText style={styles.menuItemText}>Toutes les collections</ThemedText>
        <ThemedText style={styles.collectionCount}>
          {collections.length}
        </ThemedText>
        <Ionicons name="chevron-forward" size={22} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  </View>
);

// Component to display about section
const AboutSection = ({ title, content, onPress }: { title: string, content: string, onPress: () => void }) => (
  <TouchableOpacity style={styles.aboutCard} onPress={onPress}>
    <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
    <View style={styles.aboutContent}>
      <ThemedText style={styles.aboutTitle}>{title}</ThemedText>
      <ThemedText numberOfLines={2} style={styles.aboutDescription}>{content}</ThemedText>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#8E8E93" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  console.log("🔍 ProfileScreen - INITIALIZING");
  
  const [user, setUser] = useState<any>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    console.log("🔍 ProfileScreen - MOUNTED");
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [currentUser, userCollections] = await Promise.all([
          getCurrentUser(),
          getAllCollections()
        ]);
        setUser(currentUser);
        setCollections(userCollections);
      } catch (error) {
        console.error("🔍 ProfileScreen - Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      console.log("🔍 ProfileScreen - UNMOUNTED");
    };
  }, []);
  
  const handleSignOut = async () => {
    console.log("🔍 ProfileScreen - Signing out");
    await logoutUser();
    router.replace("/login");
  };
  
  const handleLogin = () => {
    console.log("🔍 ProfileScreen - Navigating to login");
    router.push("/login");
  };
  
  const toggleDarkMode = () => {
    console.log("🔍 ProfileScreen - Toggle dark mode:", !darkModeEnabled);
    setDarkModeEnabled(!darkModeEnabled);
  };
  
  const toggleNotifications = () => {
    console.log("🔍 ProfileScreen - Toggle notifications:", !notificationsEnabled);
    setNotificationsEnabled(!notificationsEnabled);
  };
  
  console.log("🔍 ProfileScreen - RENDERING, user:", user?.nickname || "Not logged in");
  
  const renderLoggedInContent = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: insets.bottom + 85 }}>
      <View style={styles.userHeader}>
        <ThemedText style={styles.userName}>{user?.nickname}</ThemedText>
        <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
      </View>
      
      <CollectionSection collections={collections} />
      
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Compte</ThemedText>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={22} color="#FFFFFF" />
            <ThemedText style={styles.menuItemText}>Modifier le profil</ThemedText>
            <Ionicons name="chevron-forward" size={22} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.borderTop]}>
            <Ionicons name="lock-closed-outline" size={22} color="#FFFFFF" />
            <ThemedText style={styles.menuItemText}>Changer le mot de passe</ThemedText>
            <Ionicons name="chevron-forward" size={22} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>À propos</ThemedText>
        <View style={styles.aboutContainer}>
          <AboutSection
            title="Conditions d'utilisation"
            content="[DÉMO] Ces conditions d'utilisation sont fictives et ne servent que de démonstration pour l'application."
            onPress={() => Alert.alert(
              "Conditions d'utilisation",
              "[DÉMO] Ces conditions d'utilisation sont fictives et servent uniquement de démonstration. Dans une vraie application, vous trouveriez ici les véritables conditions d'utilisation du service."
            )}
          />
          <AboutSection
            title="Politique de confidentialité"
            content="[DÉMO] Notre politique de confidentialité fictive protège vos données dans cette démo d'application."
            onPress={() => Alert.alert(
              "Politique de confidentialité",
              "[DÉMO] Cette politique de confidentialité est fictive et sert uniquement de démonstration. Dans une vraie application, vous trouveriez ici la véritable politique de confidentialité détaillant la gestion de vos données."
            )}
          />
          <AboutSection
            title="Aide et support"
            content="[DÉMO] Centre d'aide fictif pour vous aider à utiliser cette démo d'application."
            onPress={() => Alert.alert(
              "Aide et support",
              "[DÉMO] Cette section d'aide est fictive et sert uniquement de démonstration. Dans une vraie application, vous trouveriez ici un véritable centre d'aide avec des guides et du support."
            )}
          />
        </View>
      </View>
      
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <ThemedText style={styles.signOutText}>Déconnexion</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
  
  const renderLoggedOutContent = () => (
    <View style={styles.centerContent}>
      <Ionicons name="person-circle-outline" size={100} color="#555" />
      <ThemedText style={styles.loggedOutTitle}>
        Connectez-vous pour accéder à votre profil
      </ThemedText>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <ThemedText style={styles.loginButtonText}>Connexion</ThemedText>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedText style={styles.pageTitle}>Profil</ThemedText>
      
      {isLoading ? (
        <View style={styles.centerContent}>
          <ThemedText>Chargement...</ThemedText>
        </View>
      ) : user ? (
        renderLoggedInContent()
      ) : (
        renderLoggedOutContent()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '700',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  userHeader: {
    padding: 24,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  menuContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  collectionCount: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 12,
  },
  aboutContainer: {
    marginHorizontal: 16,
    gap: 12,
  },
  aboutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
  },
  aboutContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  signOutButton: {
    margin: 24,
    backgroundColor: '#FF453A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loggedOutTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#1F1F1F',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
