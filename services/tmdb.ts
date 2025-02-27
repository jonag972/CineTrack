import axios from 'axios';
import { getEnv } from '../utils/env';

// Récupérer les clés API depuis notre utilitaire d'environnement
const API_KEY = getEnv('TMDB_API_KEY');
const ACCESS_TOKEN = getEnv('TMDB_ACCESS_TOKEN');

// Afficher un message de diagnostic détaillé
console.log(`🎬 TMDB API: Clé API ${API_KEY ? ('trouvée: ' + API_KEY.substring(0, 3) + '...') : 'manquante'}, Token ${ACCESS_TOKEN ? ('trouvé: ' + ACCESS_TOKEN.substring(0, 10) + '...') : 'manquant'}`);

// Afficher un avertissement si les clés sont manquantes
if (!API_KEY || !ACCESS_TOKEN) {
  console.warn('⚠️ ATTENTION: Clés API TMDB manquantes. Vérifiez votre fichier .env');
}

// Créer une instance axios avec les headers d'authentification
const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  // Ajouter l'api_key à tous les appels comme paramètre par défaut
  params: {
    api_key: API_KEY,
  }
});

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids?: number[];
}

const genreMap: { [key: number]: string } = {
  28: 'Action',
  12: 'Aventure',
  16: 'Animation',
  35: 'Comédie',
  80: 'Crime',
  99: 'Documentaire',
  18: 'Drame',
  10751: 'Famille',
  14: 'Fantastique',
  36: 'Histoire',
  27: 'Horreur',
  10402: 'Musique',
  9648: 'Mystère',
  10749: 'Romance',
  878: 'Science-fiction',
  10770: 'Téléfilm',
  53: 'Thriller',
  10752: 'Guerre',
  37: 'Western'
};

export const getGenreName = (genreId: number): string => {
  return genreMap[genreId] || 'Genre inconnu';
}

export interface SearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface GenresResponse {
  genres: Genre[];
}

export const searchMovies = async (query: string, page: number = 1): Promise<SearchResponse> => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: {
        query,
        page,
        language: 'fr-FR',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MovieCredits {
  id: number;
  cast: Cast[];
}

export const getMovieCredits = async (movieId: number): Promise<MovieCredits> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`, {
      params: {
        language: 'fr-FR',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw error;
  }
};

export const getMovieDetails = async (movieId: number): Promise<Movie> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        language: 'fr-FR',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const getSimilarMovies = async (movieId: number, page: number = 1): Promise<SearchResponse> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`, {
      params: {
        language: 'fr-FR',
        page,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    throw error;
  }
};

export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return 'https://via.placeholder.com/500x750';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getTrendingMovies = async (page: number = 1): Promise<SearchResponse> => {
  try {
    const response = await tmdbApi.get('/trending/movie/week', {
      params: {
        page,
        language: 'fr-FR',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
};

export const getNowPlayingMovies = async (page: number = 1): Promise<SearchResponse> => {
  try {
    const response = await tmdbApi.get('/movie/now_playing', {
      params: {
        page,
        language: 'fr-FR',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
};

export const getUpcomingMovies = async (page: number = 1): Promise<SearchResponse> => {
  try {
    const response = await tmdbApi.get('/movie/upcoming', {
      params: {
        page,
        language: 'fr-FR',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw error;
  }
};

export const getGenres = async (): Promise<GenresResponse> => {
  try {
    const response = await tmdbApi.get('/genre/movie/list', {
      params: {
        language: 'fr-FR',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<SearchResponse> => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        language: 'fr-FR',
        sort_by: 'popularity.desc',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw error;
  }
};
