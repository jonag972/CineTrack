import { StyleSheet, View, FlatList, TouchableOpacity, Image, Modal, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getAllCollections, Collection, createCollection } from '../../lib/collections';
import { BlurView } from 'expo-blur';
import { getImageUrl } from '@/services/tmdb';

console.log("🚀 Loading Collections screen");

const CollectionGrid = ({ posters }: { posters: string[] }) => {
  const maxPosters = posters.slice(0, 4);
  const size = maxPosters.length === 1 ? '100%' : '50%';

  return (
    <View style={styles.gridContainer}>
      {maxPosters.map((poster, index) => (
        <Image
          key={index}
          source={{ uri: getImageUrl(poster) }}
          style={[
            styles.gridImage,
            { width: size, height: size }
          ]}
        />
      ))}
    </View>
  );
};

const CollectionCard = ({ collection }: { collection: Collection }) => (
  <TouchableOpacity 
    style={styles.collectionCard}
    onPress={() => {
      console.log(`🔍 Navigating to collection/${collection.slug}`);
      router.push(`/collections/${collection.slug}`);
    }}
  >
    {collection.items.length > 0 ? (
      <CollectionGrid 
        posters={collection.items.map(item => item.posterPath).filter(Boolean) as string[]}
      />
    ) : (
      <View style={[styles.collectionBackground, { backgroundColor: '#1A1A1A' }]} />
    )}
    
    <BlurView intensity={80} tint="dark" style={styles.collectionInfo}>
      <View style={styles.collectionHeader}>
        <Ionicons 
          name={collection.icon as any || 'folder'} 
          size={24} 
          color="#FFFFFF" 
        />
        <ThemedText style={styles.collectionName}>{collection.name}</ThemedText>
      </View>
      <ThemedText style={styles.itemCount}>
        {collection.items.length} film{collection.items.length !== 1 ? 's' : ''}
      </ThemedText>
    </BlurView>
  </TouchableOpacity>
);

export default function CollectionsScreen() {
  console.log("🔍 CollectionsScreen - INITIALIZING");
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const insets = useSafeAreaInsets();
  const { refresh } = useLocalSearchParams();
  
  useEffect(() => {
    console.log("🔍 CollectionsScreen - MOUNTED");
    
    const loadCollections = async () => {
      try {
        console.log("🔍 CollectionsScreen - Loading collections");
        const data = await getAllCollections();
        console.log(`🔍 CollectionsScreen - Loaded ${data.length} collections`);
        setCollections(data);
      } catch (error) {
        console.error("🔍 CollectionsScreen - Error loading collections:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCollections();
    
    return () => {
      console.log("🔍 CollectionsScreen - UNMOUNTED");
    };
  }, [refresh]);
  
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert("Erreur", "Le nom de la collection ne peut pas être vide");
      return;
    }

    try {
      const newCollection = await createCollection(
        newCollectionName.trim(),
        newCollectionDescription.trim() || undefined
      );

      if (newCollection) {
        const updatedCollections = await getAllCollections();
        setCollections(updatedCollections);
        setShowCreateModal(false);
        setNewCollectionName('');
        setNewCollectionDescription('');
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      Alert.alert("Erreur", "Impossible de créer la collection");
    }
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText style={styles.pageTitle}>Collections</ThemedText>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add-circle" size={32} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.centerContent}>
          <ThemedText>Chargement...</ThemedText>
        </View>
      ) : collections.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="folder-open" size={80} color="#333" />
          <ThemedText style={styles.emptyText}>
            Aucune collection
          </ThemedText>
          <TouchableOpacity 
            style={styles.createFirstButton}
            onPress={() => setShowCreateModal(true)}
          >
            <ThemedText style={styles.createFirstButtonText}>
              Créer une collection
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CollectionCard collection={item} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 85 }
          ]}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}

      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
        statusBarTranslucent
      >
        <BlurView 
          intensity={80} 
          tint="dark" 
          style={[styles.modalContainer, { paddingBottom: insets.bottom }]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowCreateModal(false)}
            >
              <ThemedText style={[styles.buttonText, styles.cancelText]}>
                Annuler
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              Nouvelle collection
            </ThemedText>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleCreateCollection}
            >
              <ThemedText style={[styles.buttonText, styles.createText]}>
                Créer
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons name="folder-outline" size={22} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nom de la collection"
                  placeholderTextColor="#8E8E93"
                  value={newCollectionName}
                  onChangeText={setNewCollectionName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="document-text-outline" size={22} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description (optionnelle)"
                  placeholderTextColor="#8E8E93"
                  value={newCollectionDescription}
                  onChangeText={setNewCollectionDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '700',
  },
  createButton: {
    padding: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    color: '#999',
  },
  createFirstButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  collectionCard: {
    width: '48%',
    aspectRatio: 0.8,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  gridContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridImage: {
    backgroundColor: '#1A1A1A',
  },
  collectionBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  collectionInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  itemCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Ajout de cette ligne pour positionner le modal en bas
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 12, // Ajout des coins arrondis en haut
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalButton: {
    minWidth: 70,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 17,
  },
  cancelText: {
    color: '#8E8E93',
  },
  createText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  formContainer: {
    padding: 16,
    backgroundColor: '#1C1C1E',
  },
  inputGroup: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 4,
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    padding: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
