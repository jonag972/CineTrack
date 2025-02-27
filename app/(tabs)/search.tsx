import { StyleSheet, View, TextInput, FlatList, Image, ActivityIndicator, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { searchMovies, Movie, getImageUrl, getTrendingMovies, getGenres, getMoviesByGenre, getGenreName } from '@/services/tmdb';
import { debounce } from 'lodash';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';

interface Genre {
  id: number;
  name: string;
}

const GenreCard = ({ genre, icon, onPress }: { genre: Genre; icon: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.genreCard} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#FFFFFF" />
    <ThemedText style={styles.genreText}>{genre.name}</ThemedText>
  </TouchableOpacity>
);

console.log("🚀 Loading Search screen");

export default function SearchScreen() {
  console.log("🔍 SearchScreen - INITIALIZING");

  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const genreIcons = {
    28: 'flame', // Action
    35: 'happy', // Comedy
    18: 'theater', // Drama
    878: 'planet', // Science Fiction
    27: 'skull', // Horror
    10749: 'heart', // Romance
  };

  useEffect(() => {
    console.log("🔍 SearchScreen - MOUNTED");
    const fetchInitialData = async () => {
      try {
        const [trendingResponse, genresResponse] = await Promise.all([
          getTrendingMovies(),
          getGenres()
        ]);
        setTrendingMovies(trendingResponse.results.slice(0, 10));
        setGenres(genresResponse.genres.filter(genre => Object.keys(genreIcons).includes(genre.id.toString())));
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
    return () => {
      console.log("🔍 SearchScreen - UNMOUNTED");
    };
  }, []);

  const handleGenrePress = async (genreId: number) => {
    setLoading(true);
    setError(null);
    setSearchQuery('');

    try {
      const response = await getMoviesByGenre(genreId);
      setMovies(response.results);
    } catch (err) {
      setError('Une erreur est survenue lors de la recherche');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const TrendingMovieCard = ({ movie }: { movie: Movie }) => (
    <TouchableOpacity style={styles.trendingCard} activeOpacity={0.7} onPress={() => router.push(`/movie/${movie.id}`)}>
      <Image source={{ uri: getImageUrl(movie.poster_path, 'w342') }} style={styles.trendingPoster} />
      <BlurView intensity={80} tint="dark" style={styles.trendingInfo}>
        <ThemedText numberOfLines={1} style={styles.trendingTitle}>{movie.title}</ThemedText>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <ThemedText style={styles.ratingText}>{movie.vote_average.toFixed(1)}</ThemedText>
          {movie.genre_ids && movie.genre_ids[0] && (
            <View style={styles.genreContainer}>
              <ThemedText style={styles.genreText}>• {getGenreName(movie.genre_ids[0])}</ThemedText>
            </View>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const handleSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setMovies([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await searchMovies(query);
        setMovies(response.results);
      } catch (err) {
        setError('Une erreur est survenue lors de la recherche');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleQueryChange = (text: string) => {
    setSearchQuery(text);
    handleSearch(text);
  };

  const EmptyStateContent = () => (
    <ScrollView style={styles.emptyStateContent}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Genres populaires</ThemedText>
        <View style={styles.genreGrid}>
          {genres.map((genre) => (
            <GenreCard 
              key={genre.id} 
              genre={genre} 
              icon={genreIcons[genre.id as keyof typeof genreIcons] || 'film'} 
              onPress={() => handleGenrePress(genre.id)} 
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Tendances</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingList}
        >
          {trendingMovies.map((movie) => (
            <TrendingMovieCard key={movie.id} movie={movie} />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );

  console.log("🔍 SearchScreen - RENDERING");

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un film ou une série"
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={handleQueryChange}
        />
      </View>
      {searchQuery === '' && movies.length === 0 ? (
        <EmptyStateContent />
      ) : (
        <>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : error ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>{error}</ThemedText>
            </View>
          ) : (
            <Animated.FlatList
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
              data={movies}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.movieItem} onPress={() => router.push(`/movie/${item.id}`)}>
                  <Image
                    source={{ uri: getImageUrl(item.poster_path) }}
                    style={styles.moviePoster}
                  />
                  <BlurView intensity={80} tint="dark" style={styles.movieInfo}>
                    <ThemedText style={styles.movieTitle}>{item.title}</ThemedText>
                    <View style={styles.movieMeta}>
                      <View style={styles.metaInfo}>
                        <ThemedText style={styles.movieYear}>
                          {new Date(item.release_date).getFullYear()}
                        </ThemedText>
                        {item.genre_ids && item.genre_ids[0] && (
                          <ThemedText style={styles.movieYear}> • {getGenreName(item.genre_ids[0])}</ThemedText>
                        )}
                      </View>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <ThemedText style={styles.ratingText}>
                          {item.vote_average.toFixed(1)}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText numberOfLines={2} style={styles.movieOverview}>
                      {item.overview}
                    </ThemedText>
                  </BlurView>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyStateText}>
                    Aucun résultat trouvé
                  </ThemedText>
                </View>
              }
              contentContainerStyle={{ paddingBottom: insets.bottom + 85 }}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    margin: 16,
    borderRadius: 8,
    padding: 8,
  },
  searchIcon: {
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    padding: 8,
  },
  emptyStateContent: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  genreCard: {
    width: '48%',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  genreText: {
    marginTop: 8,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  trendingList: {
    paddingRight: 16,
  },
  trendingCard: {
    marginRight: 16,
    width: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  trendingPoster: {
    width: 140,
    height: 210,
    borderRadius: 12,
  },
  trendingInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
  movieItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
  },
  moviePoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-start',
    borderRadius: 8,
    overflow: 'hidden',
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  movieYear: {
    fontSize: 14,
    color: '#8E8E93',
  },
  movieMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  genreContainer: {
    marginLeft: 6,
  },
  genreText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  ratingText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  movieOverview: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});