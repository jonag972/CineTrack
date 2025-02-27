import { StyleSheet, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useState, useEffect } from 'react';
import { getGreeting } from '@/utils/greeting';
import { getTrendingMovies, getNowPlayingMovies, getUpcomingMovies, getImageUrl, Movie, getGenreName } from '@/services/tmdb';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';

console.log("🚀 Loading Home screen (Tabs/Index)");

const MovieCard = ({ movie }: { movie: Movie }) => (
  <TouchableOpacity 
    style={styles.movieCard}
    activeOpacity={0.7}
    onPress={() => {
      console.log(`🔍 Navigating to movie/${movie.id}`);
      router.push(`/movie/${movie.id}`);
    }}
  >
    <Image 
      source={{ uri: getImageUrl(movie.poster_path, 'w342') }} 
      style={styles.moviePoster} 
      onError={() => console.log(`🔍 Error loading image for movie: ${movie.id}`)}
    />
    <BlurView intensity={80} tint="dark" style={styles.movieInfoContainer}>
      <ThemedText numberOfLines={1} style={styles.movieTitle}>{movie.title}</ThemedText>
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

const MovieSection = ({ title, movies, isLoading }: { title: string, movies: Movie[], isLoading: boolean }) => (
  <View style={styles.section}>
    <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
    {isLoading ? (
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
    ) : (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.movieList}
        decelerationRate="fast"
        snapToInterval={156}
        contentContainerStyle={styles.movieListContent}
      >
        {movies && movies.length > 0 ? (
          movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        ) : (
          <View style={styles.noMoviesContainer}>
            <ThemedText style={styles.noMoviesText}>Aucun film disponible</ThemedText>
          </View>
        )}
      </ScrollView>
    )}
  </View>
);

export default function HomeScreen() {
  console.log("🔍 HomeScreen (Index) - INITIALIZING");
  
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  
  console.log("🔍 HomeScreen - Safe area insets:", insets);
  
  useEffect(() => {
    console.log("🔍 HomeScreen - MOUNTED");
    
    return () => {
      console.log("🔍 HomeScreen - UNMOUNTED");
    };
  }, []);
  
  useEffect(() => {
    const loadGreeting = async () => {
      console.log("🔍 HomeScreen - Loading greeting");
      try {
        const greetingText = await getGreeting();
        console.log("🔍 HomeScreen - Greeting loaded:", greetingText);
        setGreeting(greetingText);
      } catch (error) {
        console.error("🔍 HomeScreen - Error loading greeting:", error);
        setGreeting("Bienvenue");
      }
    };
    loadGreeting();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      console.log("🔍 HomeScreen - Fetching movies");
      setIsLoading(true);
      setError(null);
      
      try {
        const [trending, nowPlaying, upcoming] = await Promise.all([
          getTrendingMovies(),
          getNowPlayingMovies(),
          getUpcomingMovies()
        ]);
        console.log("🔍 HomeScreen - Movies fetched successfully");
        
        // Accéder à la propriété results des réponses
        setTrendingMovies(trending.results || []);
        setNowPlayingMovies(nowPlaying.results || []);
        setUpcomingMovies(upcoming.results || []);
      } catch (err) {
        console.error("🔍 HomeScreen - Error fetching movies:", err);
        setError("Impossible de charger les films. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovies();
  }, []);
  
  console.log("🔍 HomeScreen - RENDERING with greeting:", greeting);
  
  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 85 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerText}>{greeting}</ThemedText>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : (
        <>
          <MovieSection title="Tendances" movies={trendingMovies} isLoading={isLoading} />
          <MovieSection title="À l'affiche" movies={nowPlayingMovies} isLoading={isLoading} />
          <MovieSection title="Prochainement" movies={upcomingMovies} isLoading={isLoading} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  headerText: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  movieList: {
    paddingHorizontal: 16,
  },
  movieListContent: {
    paddingRight: 16,
  },
  movieCard: {
    marginRight: 16,
    width: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  moviePoster: {
    width: 140,
    height: 210,
    borderRadius: 12,
  },
  movieInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
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
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
  },
  noMoviesContainer: {
    width: 200,
    height: 210,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
  },
  noMoviesText: {
    color: '#FFFFFF',
    opacity: 0.7,
  },
});