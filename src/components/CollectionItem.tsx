import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

// Simple props interface
interface CollectionItemProps {
  item: {
    id: string;
    name: string;
  };
  onAdd: (item: any) => Promise<void> | void;
  onRemove: (item: any) => Promise<void> | void;
}

const CollectionItem = ({ item, onAdd, onRemove }: CollectionItemProps) => {
  // Async handlers
  const handleAddToCollection = async () => {
    await onAdd(item);
  };

  const handleRemoveFromCollection = async () => {
    await onRemove(item);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.name}</Text>
      <View style={styles.buttonsContainer}>
        <Pressable style={[styles.button, styles.addButton]} onPress={handleAddToCollection}>
          <Text style={styles.buttonText}>Add to Collection</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.removeButton]} onPress={handleRemoveFromCollection}>
          <Text style={styles.buttonText}>Remove from Collection</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButton: {
    backgroundColor: '#3498db',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default CollectionItem;
