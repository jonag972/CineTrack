import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Animated, Platform, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Movie, getImageUrl, getGenreName, getMovieCredits, getSimilarMovies, Cast, getTrendingMovies, getNowPlayingMovies, getUpcomingMovies, getMovieDetails } from '@/services/tmdb';
import { isMovieFavorite, isMovieWatched, addToFavorites, removeFromFavorites, addToWatched, removeFromWatched } from '@/utils/userPreferences';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllCollections, addMovieToCollection } from '../../lib/collections';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [customLists, setCustomLists] = useState<{[key: string]: MoviePreference[]}>({});
  const [selectedCollection, setSelectedCollection] = useState('');
  const insets = useSafeAreaInsets();
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const loadCustomLists = async () => {
      try {
        const listsData = await AsyncStorage.getItem('@custom_lists');
        if (listsData) {
          setCustomLists(JSON.parse(listsData));
        }
      } catch (error) {
        console.error('Error loading custom lists:', error);
      }
    };
    loadCustomLists();
  }, []);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        const [movieDetails, credits, similar, userCollections] = await Promise.all([
          getMovieDetails(Number(id)),
          getMovieCredits(Number(id)),
          getSimilarMovies(Number(id)),
          getAllCollections()
        ]);
        setMovie(movieDetails);
        setCast(credits.cast);
        setSimilarMovies(similar.results);
        setCollections(userCollections);

        // Check movie status
        const [favoriteStatus, watchedStatus] = await Promise.all([
          isMovieFavorite(Number(id)),
          isMovieWatched(Number(id))
        ]);
        setIsFavorite(favoriteStatus);
        setIsWatched(watchedStatus);
      } catch (error) {
        console.error('Error fetching movie data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovieData();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!movie) return;
    if (isFavorite) {
      await removeFromFavorites(movie.id);
    } else {
      await addToFavorites(movie);
    }
    setIsFavorite(!isFavorite);
  };

  const handleToggleWatched = async () => {
    if (!movie) return;
    if (isWatched) {
      await removeFromWatched(movie.id);
    } else {
      await addToWatched(movie);
    }
    setIsWatched(!isWatched);
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (!movie) return;
    
    try {
      const success = await addMovieToCollection(collectionId, movie);
      if (success) {
        // Rafraîchir les collections après l'ajout
        const updatedCollections = await getAllCollections();
        setCollections(updatedCollections);
        // Envoyer un événement pour rafraîchir la page des collections
        router.push({
          pathname: '/(tabs)/collections',
          params: { refresh: Date.now() }
        });
      }
      setShowCollectionModal(false);
    } catch (error) {
      console.error('Error adding movie to collection:', error);
    }
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        { 
          opacity: headerOpacity,
          paddingTop: insets.top,
        }
      ]}
    >
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.headerContent}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText numberOfLines={1} style={styles.headerTitle}>
          {movie?.title}
        </ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleToggleWatched}
          >
            <Ionicons 
              name={isWatched ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleToggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowCollectionModal(true)}
          >
            <Ionicons name="folder-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  if (isLoading || !movie) {
    return (
      <View style={styles.loadingContainer}>
        {/* TODO: Add loading skeleton */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20
        }}
      >
        <View style={styles.backdropContainer}>
          <Image
            source={{ uri: getImageUrl(movie.backdrop_path, 'original') }}
            style={styles.backdropImage}
          />
          <LinearGradient
            colors={['transparent', '#000000']}
            style={styles.gradient}
          />
          <View style={[styles.movieInfo, { paddingTop: insets.top + 200 }]}>
            <Image
              source={{ uri: getImageUrl(movie.poster_path, 'w342') }}
              style={styles.posterImage}
            />
            <View style={styles.infoContainer}>
              <ThemedText style={styles.title}>{movie.title}</ThemedText>
              <View style={styles.metaInfo}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <ThemedText style={styles.rating}>
                    {movie.vote_average.toFixed(1)}
                  </ThemedText>
                </View>
                {movie.genre_ids && movie.genre_ids[0] && (
                  <ThemedText style={styles.genre}>
                    • {getGenreName(movie.genre_ids[0])}
                  </ThemedText>
                )}
                <ThemedText style={styles.year}>
                  • {new Date(movie.release_date).getFullYear()}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Synopsis</ThemedText>
            <ThemedText style={styles.overview}>{movie.overview}</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Distribution</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castList}>
              {cast.map((person, index) => (
                <View key={`cast-${person.id}-${index}`} style={styles.castCard}>
                  <Image 
                    source={{ uri: getImageUrl(person.profile_path, 'w185') }} 
                    style={styles.castImage}
                    defaultSource={{ uri: 'https://via.placeholder.com/80' }}
                  />
                  <ThemedText numberOfLines={1} style={styles.castName}>{person.name}</ThemedText>
                  <ThemedText numberOfLines={1} style={styles.castRole}>{person.character}</ThemedText>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Films similaires</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarList}>
              {similarMovies.map((movie, index) => (
                <TouchableOpacity 
                  key={`similar-${movie.id}-${index}`} 
                  style={styles.similarCard}
                  onPress={() => router.push(`/movie/${movie.id}`)}
                >
                  <Image 
                    source={{ uri: getImageUrl(movie.poster_path, 'w342') }} 
                    style={styles.similarPoster}
                  />
                  <BlurView intensity={80} tint="dark" style={styles.similarInfo}>
                    <ThemedText numberOfLines={1} style={styles.similarTitle}>{movie.title}</ThemedText>
                    <View style={styles.similarMeta}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <ThemedText style={styles.similarRating}>{movie.vote_average.toFixed(1)}</ThemedText>
                      {movie.genre_ids && movie.genre_ids[0] && (
                        <ThemedText style={styles.similarRating}> • {getGenreName(movie.genre_ids[0])}</ThemedText>
                      )}
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Animated.ScrollView>

      {renderHeader()}

      <Modal
        visible={showCollectionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCollectionModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCollectionModal(false)}
        >
          <BlurView intensity={80} tint="dark" style={styles.collectionModal}>
            <ThemedText style={styles.modalTitle}>Ajouter à une collection</ThemedText>
            
            <ScrollView style={styles.collectionList}>
              {collections.map((collection) => (
                <TouchableOpacity
                  key={collection.id}
                  style={styles.collectionItem}
                  onPress={() => handleAddToCollection(collection.id)}
                >
                  <View style={styles.collectionItemContent}>
                    <Ionicons 
                      name={collection.icon as any || "folder"} 
                      size={24} 
                      color="#FFFFFF" 
                    />
                    <ThemedText style={styles.collectionName}>
                      {collection.name}
                    </ThemedText>
                    <ThemedText style={styles.collectionCount}>
                      {collection.items.length} films
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {collections.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open" size={48} color="#555" />
                <ThemedText style={styles.emptyCollectionText}>
                  Vous n'avez pas encore de collection
                </ThemedText>
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => {
                    setShowCollectionModal(false);
                    router.push('/(tabs)/collections');
                  }}
                >
                  <ThemedText style={styles.createButtonText}>
                    Créer une collection
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </BlurView>
        </TouchableOpacity>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerContent: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backdropContainer: {
    height: 500,
    width: '100%',
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  movieInfo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    flexDirection: 'row',
  },
  posterImage: {
    width: 120,
    height: 180,
    borderRadius: 12,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  genre: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  year: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  overview: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 24,
  },
  castList: {
    marginTop: 12,
  },
  castCard: {
    width: 100,
    marginRight: 16,
    alignItems: 'center',
  },
  castImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F1F1F',
    marginBottom: 8,
  },
  castName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  castRole: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  similarList: {
    marginTop: 12,
  },
  similarCard: {
    width: 140,
    height: 210,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1F1F1F',
  },
  similarPoster: {
    width: 140,
    height: 210,
    borderRadius: 12,
    backgroundColor: '#1F1F1F',
  },
  similarImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  similarInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  similarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  similarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  similarRating: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1F1F',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionModal: {
    width: '80%',
    maxHeight: '70%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 31, 31, 0.9)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  collectionList: {
    maxHeight: '80%',
  },
  collectionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  collectionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  collectionName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  collectionCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  createButton: {
    marginTop: 16,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCollectionText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});