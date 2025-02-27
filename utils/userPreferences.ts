import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from './auth';
import { Movie } from '../services/tmdb';
import { addMovieToCollection, removeMovieFromCollection, getAllCollections } from '../lib/collections';

// Storage keys
const WATCHLIST_KEY = '@watchlist';
const FAVORITES_KEY = '@favorites';
const WATCHED_KEY = '@watched';
const CUSTOM_LISTS_KEY = '@custom_lists';

export interface MoviePreference {
  id: number;
  title: string;
  poster_path: string;
  type: 'movie' | 'tv';
  vote_average?: number;
  genre_ids?: number[];
  addedAt: number;
}

interface UserPreferences {
  watchlist: MoviePreference[];
  favorites: MoviePreference[];
  watched: MoviePreference[];
  customLists: { [key: string]: MoviePreference[] };
}

// Helper function to get user-specific key
const getUserKey = async (baseKey: string): Promise<string> => {
  const user = await getCurrentUser();
  return user ? `${baseKey}_${user.email}` : baseKey;
};

// Initialize preferences
const initializePreferences = async (): Promise<UserPreferences> => {
  return {
    watchlist: [],
    favorites: [],
    watched: [],
    customLists: {}
  };
};

// Get user preferences
const getPreferences = async (): Promise<UserPreferences> => {
  try {
    const watchlistKey = await getUserKey(WATCHLIST_KEY);
    const favoritesKey = await getUserKey(FAVORITES_KEY);
    const watchedKey = await getUserKey(WATCHED_KEY);
    const customListsKey = await getUserKey(CUSTOM_LISTS_KEY);

    const [watchlistData, favoritesData, watchedData, customListsData] = await Promise.all([
      AsyncStorage.getItem(watchlistKey),
      AsyncStorage.getItem(favoritesKey),
      AsyncStorage.getItem(watchedKey),
      AsyncStorage.getItem(customListsKey)
    ]);

    return {
      watchlist: watchlistData ? JSON.parse(watchlistData) : [],
      favorites: favoritesData ? JSON.parse(favoritesData) : [],
      watched: watchedData ? JSON.parse(watchedData) : [],
      customLists: customListsData ? JSON.parse(customListsData) : {}
    };
  } catch (error) {
    console.error('Error getting preferences:', error);
    return initializePreferences();
  }
};

// Add item to list
const addToList = async (item: Omit<MoviePreference, 'addedAt'>, list: keyof UserPreferences): Promise<boolean> => {
  try {
    const key = await getUserKey(list === 'watchlist' ? WATCHLIST_KEY : list === 'favorites' ? FAVORITES_KEY : WATCHED_KEY);
    const currentData = await AsyncStorage.getItem(key);
    const items: MoviePreference[] = currentData ? JSON.parse(currentData) : [];

    if (!items.some(i => i.id === item.id && i.type === item.type)) {
      const newItem: MoviePreference = { ...item, addedAt: Date.now() };
      items.push(newItem);
      await AsyncStorage.setItem(key, JSON.stringify(items));
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error adding to ${list}:`, error);
    return false;
  }
};

// Remove item from list
const removeFromList = async (itemId: number, type: 'movie' | 'tv', list: keyof UserPreferences): Promise<boolean> => {
  try {
    const key = await getUserKey(list === 'watchlist' ? WATCHLIST_KEY : list === 'favorites' ? FAVORITES_KEY : WATCHED_KEY);
    const currentData = await AsyncStorage.getItem(key);
    if (!currentData) return false;

    const items: MoviePreference[] = JSON.parse(currentData);
    const filteredItems = items.filter(item => !(item.id === itemId && item.type === type));
    
    await AsyncStorage.setItem(key, JSON.stringify(filteredItems));
    return true;
  } catch (error) {
    console.error(`Error removing from ${list}:`, error);
    return false;
  }
};

// Add to custom list
const addToCustomList = async (item: Omit<MoviePreference, 'addedAt'>, listName: string): Promise<boolean> => {
  try {
    const customListsKey = await getUserKey(CUSTOM_LISTS_KEY);
    const currentData = await AsyncStorage.getItem(customListsKey);
    const customLists = currentData ? JSON.parse(currentData) : {};

    if (!customLists[listName]) {
      customLists[listName] = [];
    }

    if (!customLists[listName].some((i: MoviePreference) => i.id === item.id)) {
      const newItem: MoviePreference = { ...item, addedAt: Date.now() };
      customLists[listName].push(newItem);
      await AsyncStorage.setItem(customListsKey, JSON.stringify(customLists));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding to custom list:', error);
    return false;
  }
};

// Remove from custom list
const removeFromCustomList = async (itemId: number, listName: string): Promise<boolean> => {
  try {
    const customListsKey = await getUserKey(CUSTOM_LISTS_KEY);
    const currentData = await AsyncStorage.getItem(customListsKey);
    if (!currentData) return false;

    const customLists = JSON.parse(currentData);
    if (!customLists[listName]) return false;

    customLists[listName] = customLists[listName].filter((item: MoviePreference) => item.id !== itemId);
    await AsyncStorage.setItem(customListsKey, JSON.stringify(customLists));
    return true;
  } catch (error) {
    console.error('Error removing from custom list:', error);
    return false;
  }
};

// Delete custom list
const deleteCustomList = async (listName: string): Promise<boolean> => {
  try {
    const customListsKey = await getUserKey(CUSTOM_LISTS_KEY);
    const currentData = await AsyncStorage.getItem(customListsKey);
    if (!currentData) return false;

    const customLists = JSON.parse(currentData);
    delete customLists[listName];
    await AsyncStorage.setItem(customListsKey, JSON.stringify(customLists));
    return true;
  } catch (error) {
    console.error('Error deleting custom list:', error);
    return false;
  }
};

export {
  addToList,
  removeFromList,
  getPreferences,
  addToCustomList,
  removeFromCustomList,
  deleteCustomList,
  type MoviePreference
};

// Check if item is in list
const isInList = async (itemId: number, type: 'movie' | 'tv', list: keyof UserPreferences): Promise<boolean> => {
  try {
    const key = await getUserKey(list === 'watchlist' ? WATCHLIST_KEY : list === 'favorites' ? FAVORITES_KEY : WATCHED_KEY);
    const currentData = await AsyncStorage.getItem(key);
    if (!currentData) return false;

    const items: MediaItem[] = JSON.parse(currentData);
    return items.some(item => item.id === itemId && item.type === type);
  } catch (error) {
    console.error(`Error checking ${list}:`, error);
    return false;
  }
};

// Rate media
const rateMedia = async (itemId: number, type: 'movie' | 'tv', rating: number): Promise<boolean> => {
  try {
    const key = await getUserKey(WATCHED_KEY);
    const currentData = await AsyncStorage.getItem(key);
    const items: MediaItem[] = currentData ? JSON.parse(currentData) : [];

    const existingIndex = items.findIndex(item => item.id === itemId && item.type === type);
    if (existingIndex >= 0) {
      items[existingIndex].rating = rating;
    } else {
      items.push({
        id: itemId,
        type,
        rating,
        title: '', // This should be filled with actual title
        posterPath: '', // This should be filled with actual poster path
        addedAt: Date.now()
      });
    }

    await AsyncStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Error rating media:', error);
    return false;
  }
};

// Get media rating
const getMediaRating = async (itemId: number, type: 'movie' | 'tv'): Promise<number | null> => {
  try {
    const key = await getUserKey(WATCHED_KEY);
    const currentData = await AsyncStorage.getItem(key);
    if (!currentData) return null;

    const items: MediaItem[] = JSON.parse(currentData);
    const item = items.find(i => i.id === itemId && i.type === type);
    return item?.rating ?? null;
  } catch (error) {
    console.error('Error getting media rating:', error);
    return null;
  }
};

// Check if movie is favorite
export const isMovieFavorite = async (movieId: number): Promise<boolean> => {
  try {
    const collections = await getAllCollections();
    const favorites = collections.find(c => c.id === 'favorites');
    return favorites?.items.some(item => item.mediaId === movieId) || false;
  } catch (error) {
    console.error('Error checking if movie is favorite:', error);
    return false;
  }
};

// Check if movie is watched
export const isMovieWatched = async (movieId: number): Promise<boolean> => {
  try {
    const collections = await getAllCollections();
    const watched = collections.find(c => c.id === 'watched');
    return watched?.items.some(item => item.mediaId === movieId) || false;
  } catch (error) {
    console.error('Error checking if movie is watched:', error);
    return false;
  }
};

// Add movie to favorites
export const addToFavorites = async (movie: Movie): Promise<boolean> => {
  return addMovieToCollection('favorites', movie);
};

// Remove movie from favorites
export const removeFromFavorites = async (movieId: number): Promise<boolean> => {
  return removeMovieFromCollection('favorites', movieId);
};

// Add movie to watched
export const addToWatched = async (movie: Movie): Promise<boolean> => {
  return addMovieToCollection('watched', movie);
};

// Remove movie from watched
export const removeFromWatched = async (movieId: number): Promise<boolean> => {
  return removeMovieFromCollection('watched', movieId);
};

// Get favorite movies
export const getFavoriteMovies = async (): Promise<any[]> => {
  const prefs = await getPreferences();
  return prefs.favorites;
};

// Get watched movies
export const getWatchedMovies = async (): Promise<any[]> => {
  const prefs = await getPreferences();
  return prefs.watched;
};

export const userPreferences = {
  getPreferences,
  addToList,
  removeFromList,
  isInList,
  rateMedia,
  getMediaRating,
  isMovieFavorite,
  isMovieWatched,
  addToFavorites,
  removeFromFavorites,
  addToWatched,
  removeFromWatched,
  getFavoriteMovies,
  getWatchedMovies
};
