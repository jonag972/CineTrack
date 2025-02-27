import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from '../services/tmdb';
import { Collection } from '../src/types';

export interface CollectionItem {
  id: string;
  mediaId: number;
  mediaType: 'movie';
  name: string;
  posterPath?: string;
  voteAverage?: number;
  addedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isDefault?: boolean;
  icon?: string;
  items: CollectionItem[];
  createdAt: string;
  updatedAt: string;
}

const COLLECTIONS_STORAGE_KEY = '@collections';

const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'watched',
    name: 'Films vus',
    slug: 'watched',
    description: 'Les films que vous avez regardés',
    isDefault: true,
    icon: 'eye',
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'favorites',
    name: 'Favoris',
    slug: 'favorites',
    description: 'Vos films préférés',
    isDefault: true,
    icon: 'heart',
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const initializeCollections = async (): Promise<void> => {
  try {
    const existingCollections = await AsyncStorage.getItem(COLLECTIONS_STORAGE_KEY);
    if (!existingCollections) {
      await AsyncStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(DEFAULT_COLLECTIONS));
    }
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
};

export const getAllCollections = async (): Promise<Collection[]> => {
  try {
    const collectionsJson = await AsyncStorage.getItem(COLLECTIONS_STORAGE_KEY);
    if (!collectionsJson) {
      await initializeCollections();
      return DEFAULT_COLLECTIONS;
    }
    return JSON.parse(collectionsJson);
  } catch (error) {
    console.error('Error getting collections:', error);
    return [];
  }
};

export const getCollectionBySlug = async (slug: string): Promise<Collection | null> => {
  try {
    const collections = await getAllCollections();
    return collections.find(collection => collection.slug === slug) || null;
  } catch (error) {
    console.error('Error getting collection:', error);
    return null;
  }
};

export const createCollection = async (name: string, description?: string): Promise<Collection | null> => {
  try {
    const collections = await getAllCollections();
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    const newCollection: Collection = {
      id: Date.now().toString(),
      name,
      slug,
      description,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    collections.push(newCollection);
    await AsyncStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
    return newCollection;
  } catch (error) {
    console.error('Error creating collection:', error);
    return null;
  }
};

export const addMovieToCollection = async (collectionId: string, movie: Movie): Promise<boolean> => {
  try {
    const collections = await getAllCollections();
    const collection = collections.find(c => c.id === collectionId);
    
    if (!collection) return false;
    
    // Vérifier si le film n'est pas déjà dans la collection
    if (collection.items.some(item => item.mediaId === movie.id)) {
      return false;
    }
    
    const newItem: CollectionItem = {
      id: `${movie.id}-${Date.now()}`,
      mediaId: movie.id,
      mediaType: 'movie',
      name: movie.title,
      posterPath: movie.poster_path || undefined,
      voteAverage: movie.vote_average,
      addedAt: new Date().toISOString(),
    };
    
    collection.items.push(newItem);
    collection.updatedAt = new Date().toISOString();
    
    await AsyncStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
    return true;
  } catch (error) {
    console.error('Error adding movie to collection:', error);
    return false;
  }
};

export const removeMovieFromCollection = async (collectionId: string, movieId: number): Promise<boolean> => {
  try {
    const collections = await getAllCollections();
    const collection = collections.find(c => c.id === collectionId);
    
    if (!collection) return false;
    
    collection.items = collection.items.filter(item => item.mediaId !== movieId);
    collection.updatedAt = new Date().toISOString();
    
    await AsyncStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
    return true;
  } catch (error) {
    console.error('Error removing movie from collection:', error);
    return false;
  }
};

export const deleteCollection = async (collectionId: string): Promise<boolean> => {
  try {
    const collections = await getAllCollections();
    const collection = collections.find(c => c.id === collectionId);
    
    if (!collection || collection.isDefault) {
      return false;
    }
    
    const updatedCollections = collections.filter(c => c.id !== collectionId);
    await AsyncStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(updatedCollections));
    return true;
  } catch (error) {
    console.error('Error deleting collection:', error);
    return false;
  }
};

export const updateCollection = async (collectionId: string, updates: { name?: string, description?: string }): Promise<boolean> => {
  try {
    const collections = await getAllCollections();
    const collection = collections.find(c => c.id === collectionId);
    
    if (!collection || collection.isDefault) {
      return false;
    }
    
    // Mettre à jour les champs
    if (updates.name) {
      collection.name = updates.name;
      collection.slug = updates.name.toLowerCase().replace(/\s+/g, '-');
    }
    if (updates.description !== undefined) {
      collection.description = updates.description;
    }
    collection.updatedAt = new Date().toISOString();
    
    await AsyncStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
    return true;
  } catch (error) {
    console.error('Error updating collection:', error);
    return false;
  }
};