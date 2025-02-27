import axios from 'axios';

const TMDB_API_KEY = 'e785820c735b5217d1dc75dfef33ce75';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNzg1ODIwYzczNWI1MjE3ZDFkYzc1ZGZlZjMzY2U3NSIsIm5iZiI6MTc0MDQzMTUwNC40MTI5OTk5LCJzdWIiOiI2N2JjZTA5MGI0NmNjMzFiMjA2YmRjNmEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ID_9EoIRGRrWBf9TQ6Gl0GAk_XDK0dqMFyLB9dippWw';

const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
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