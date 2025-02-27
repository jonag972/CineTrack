import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

// Interface des props
interface CollectionItemProps {
  item: {
    id: string;
    name: string;
  };
  onAdd: (item: any) => Promise<void> | void;
  onRemove: (item: any) => Promise<void> | void;
}

const CollectionItem = ({ item, onAdd, onRemove }: CollectionItemProps) => {
  console.log(`🔍 CollectionItem - Rendering item: ${item.id}`);
  
  // Handlers asynchrones
  const handleAddToCollection = async () => {
    console.log(`🔍 CollectionItem - Adding item: ${item.id}`);
    await onAdd(item);
  };
  
  const handleRemoveFromCollection = async () => {
    console.log(`🔍 CollectionItem - Removing item: ${item.id}`);
    await onRemove(item);
  };
  
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{item.name}</ThemedText>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleAddToCollection}
        >
          <Ionicons name="add-circle" size={20} color="#007AFF" />
          <ThemedText style={styles.buttonText}>Ajouter</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleRemoveFromCollection}
        >
          <Ionicons name="remove-circle" size={20} color="#FF3B30" />
          <ThemedText style={[styles.buttonText, styles.removeText]}>Retirer</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1F1F1F',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  buttonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  removeText: {
    color: '#FF3B30',
  }
});

export default CollectionItem;