import { Collection } from '../types';

// This is a placeholder function until your actual database implementation
export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    // For testing, return mock data
    if (slug === 'favorites') {
      return {
        id: '1',
        name: 'Favorites',
        slug: 'favorites',
        items: [
          {
            id: '101',
            mediaId: '500',
            mediaType: 'movie',
            name: 'Sample Movie'
          }
        ]
      };
    }
    
    if (slug === 'movies') {
      return {
        id: '2',
        name: 'Movies',
        slug: 'movies',
        items: [
          {
            id: '102',
            mediaId: '501',
            mediaType: 'movie',
            name: 'Another Sample Movie'
          }
        ]
      };
    }
    
    // Return null for unknown collections
    return null;
  } catch (error) {
    console.error("Error fetching collection:", error);
    return null;
  }
}

export async function getAllCollections(): Promise<Collection[]> {
  return [
    {
      id: '1',
      name: 'Favorites',
      slug: 'favorites',
      items: []
    },
    {
      id: '2',
      name: 'Movies',
      slug: 'movies',
      items: []
    }
  ];
}
