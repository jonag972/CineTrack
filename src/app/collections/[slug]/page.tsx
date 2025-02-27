import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getCollectionBySlug } from '../../../lib/collections';
import CollectionItem from '../../../components/CollectionItem';
import { Collection } from '../../../types';

export default function CollectionPage() {
  const { slug } = useLocalSearchParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollection() {
      if (typeof slug === 'string') {
        const data = await getCollectionBySlug(slug);
        setCollection(data);
      }
      setLoading(false);
    }
    
    fetchCollection();
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.container}>
        <Text>Collection not found</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>{collection.name}</Text>
        <View style={styles.itemsContainer}>
          {collection.items?.map((item) => (
            <CollectionItem 
              key={item.id} 
              item={item} 
              onAdd={() => console.log('Add', item.id)}
              onRemove={() => console.log('Remove', item.id)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemsContainer: {
    gap: 12,
  },
});
