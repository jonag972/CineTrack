import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getCollectionBySlug, removeMovieFromCollection, deleteCollection, updateCollection } from '../../../lib/collections';
import { ThemedText } from '../../../components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../../../services/tmdb';
import { Collection } from '../../../src/types';
import { BlurView } from 'expo-blur';

console.log("🔍 Collection Page - INITIALIZING");

const SpecialCollectionIds = ['watched', 'favorites'];

const ActionButton = ({ onPress, icon, color, label }: { onPress: () => void, icon: any, color: string, label: string }) => (
  <TouchableOpacity
    style={styles.actionButton}
    onPress={onPress}
  >
    <View style={[styles.actionIconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon} size={20} color="#FFFFFF" />
    </View>
    <ThemedText style={styles.actionLabel}>{label}</ThemedText>
  </TouchableOpacity>
);

export default function CollectionPage() {
  const { slug } = useLocalSearchParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    async function fetchCollection() {
      try {
        if (typeof slug === 'string') {
          const data = await getCollectionBySlug(slug);
          setCollection(data);
        }
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCollection();
  }, [slug]);

  const handleRemoveMovie = async (movieId: number) => {
    if (!collection) return;
    
    try {
      const success = await removeMovieFromCollection(collection.id, movieId);
      if (success) {
        // Rafraîchir la collection
        const updatedCollection = await getCollectionBySlug(collection.slug);
        setCollection(updatedCollection);
        // Retourner à la page des collections avec un paramètre de rafraîchissement
        router.push({
          pathname: '/(tabs)/collections',
          params: { refresh: Date.now() }
        });
      }
    } catch (error) {
      console.error("Error removing movie:", error);
    }
  };

  const handleDeleteCollection = async () => {
    if (!collection) return;
    
    if (SpecialCollectionIds.includes(collection.id)) {
      Alert.alert(
        "Action impossible",
        "Les collections 'Films vus' et 'Favoris' ne peuvent pas être supprimées."
      );
      return;
    }

    Alert.alert(
      "Supprimer la collection",
      `Êtes-vous sûr de vouloir supprimer la collection "${collection.name}" ? Cette action est irréversible.`,
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCollection(collection.id);
              router.replace({
                pathname: '/(tabs)/collections',
                params: { refresh: Date.now() }
              });
            } catch (error) {
              console.error("Error deleting collection:", error);
              Alert.alert("Erreur", "Impossible de supprimer la collection");
            }
          }
        }
      ]
    );
  };

  const handleUpdateCollection = async () => {
    if (!collection) return;
    
    if (!editName.trim()) {
      Alert.alert("Erreur", "Le nom de la collection ne peut pas être vide");
      return;
    }

    try {
      const success = await updateCollection(collection.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined
      });

      if (success) {
        const updatedCollection = await getCollectionBySlug(editName.trim().toLowerCase().replace(/\s+/g, '-'));
        setCollection(updatedCollection);
        setShowEditModal(false);
        router.setParams({ slug: updatedCollection?.slug || slug });
      } else {
        Alert.alert("Erreur", "Impossible de modifier la collection");
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la modification");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText>Chargement...</ThemedText>
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText>Collection introuvable</ThemedText>
      </View>
    );
  }

  const renderMovieItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.movieItem}
      onPress={() => router.push(`/movie/${item.mediaId}`)}
    >
      <Image 
        source={{ uri: getImageUrl(item.posterPath) }}
        style={styles.poster}
      />
      <BlurView intensity={80} tint="dark" style={styles.movieInfo}>
        <View style={styles.movieContent}>
          <ThemedText style={styles.movieTitle} numberOfLines={1}>
            {item.name}
          </ThemedText>
          {item.voteAverage && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={styles.rating}>
                {item.voteAverage.toFixed(1)}
              </ThemedText>
            </View>
          )}
        </View>
        {isEditing && (
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveMovie(item.mediaId)}
          >
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </BlurView>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
      </TouchableOpacity>
      <ThemedText style={styles.title}>{collection?.name}</ThemedText>
      <TouchableOpacity 
        style={styles.moreButton}
        onPress={() => setShowActionSheet(true)}
      >
        <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      {collection.items.length > 0 ? (
        <FlatList
          data={collection.items}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 85 }
          ]}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="film-outline" size={64} color="#555" />
          <ThemedText style={styles.emptyText}>
            Cette collection est vide
          </ThemedText>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/search')}
          >
            <ThemedText style={styles.browseButtonText}>
              Parcourir les films
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Sheet Modal */}
      <Modal
        visible={showActionSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity 
          style={styles.actionSheetOverlay}
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        >
          <View style={[styles.actionSheet, { paddingBottom: insets.bottom }]}>
            {!SpecialCollectionIds.includes(collection?.id || '') && (
              <>
                <TouchableOpacity
                  style={styles.actionSheetButton}
                  onPress={() => {
                    setEditName(collection?.name || '');
                    setEditDescription(collection?.description || '');
                    setShowEditModal(true);
                    setShowActionSheet(false);
                  }}
                >
                  <Ionicons name="pencil" size={20} color="#007AFF" />
                  <ThemedText style={styles.actionSheetButtonText}>
                    Modifier la collection
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionSheetButton, styles.actionSheetButtonBorder]}
                  onPress={() => {
                    handleDeleteCollection();
                    setShowActionSheet(false);
                  }}
                >
                  <Ionicons name="trash" size={20} color="#FF3B30" />
                  <ThemedText style={[styles.actionSheetButtonText, styles.actionSheetButtonTextDestructive]}>
                    Supprimer la collection
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.actionSheetButton, styles.actionSheetButtonBorder]}
              onPress={() => {
                setIsEditing(!isEditing);
                setShowActionSheet(false);
              }}
            >
              <Ionicons name={isEditing ? "checkmark" : "list"} size={20} color="#007AFF" />
              <ThemedText style={styles.actionSheetButtonText}>
                {isEditing ? "Terminer" : "Gérer les films"}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionSheetCancelButton, { marginTop: 8 }]}
              onPress={() => setShowActionSheet(false)}
            >
              <ThemedText style={styles.actionSheetCancelButtonText}>
                Annuler
              </ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Modal reste inchangé */}
      {showEditModal && (
        <Modal
          visible={showEditModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEditModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowEditModal(false)}
          >
            <BlurView 
              intensity={80} 
              tint="dark" 
              style={[styles.editModal, { paddingBottom: insets.bottom }]}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={() => setShowEditModal(false)}
                >
                  <ThemedText style={[styles.buttonText, styles.cancelText]}>
                    Annuler
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>
                  Modifier la collection
                </ThemedText>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={handleUpdateCollection}
                >
                  <ThemedText style={[styles.buttonText, styles.updateText]}>
                    Modifier
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nom de la collection"
                    placeholderTextColor="#8E8E93"
                    value={editName}
                    onChangeText={setEditName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description (optionnelle)"
                    placeholderTextColor="#8E8E93"
                    value={editDescription}
                    onChangeText={setEditDescription}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        </Modal>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  movieItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    aspectRatio: 0.7,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  movieInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  movieContent: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
  },
  removeButton: {
    marginLeft: 8,
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  editModal: {
    backgroundColor: 'rgba(31, 31, 31, 0.9)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalButton: {
    minWidth: 60,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '400',
  },
  cancelText: {
    color: '#8E8E93',
  },
  updateText: {
    color: '#0A84FF',
    fontWeight: '600',
  },
  formContainer: {
    padding: 16,
    gap: 16,
  },
  inputContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 17,
    padding: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  moreButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  actionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  actionsContent: {
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  cancelButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0A84FF',
  },
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  actionSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginVertical: 4,
    gap: 12,
  },
  actionSheetButtonBorder: {
    borderTopWidth: 0,
  },
  actionSheetButtonText: {
    fontSize: 17,
    color: '#007AFF',
  },
  actionSheetButtonTextDestructive: {
    color: '#FF3B30',
  },
  actionSheetCancelButton: {
    backgroundColor: '#2C2C2E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionSheetCancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
});