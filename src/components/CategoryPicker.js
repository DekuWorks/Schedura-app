import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';

const predefinedCategories = [
  { id: '1', name: 'Work', color: '#4ECDC4' },
  { id: '2', name: 'Personal', color: '#FF6B6B' },
  { id: '3', name: 'Health', color: '#96CEB4' },
  { id: '4', name: 'Learning', color: '#FFEAA7' },
  { id: '5', name: 'Finance', color: '#DDA0DD' },
  { id: '6', name: 'Travel', color: '#85C1E9' },
  { id: '7', name: 'Home', color: '#F8C471' },
  { id: '8', name: 'Social', color: '#82E0AA' },
];

export default function CategoryPicker({ visible, onClose, onSelectCategory, selectedCategoryId }) {
  const [categories, setCategories] = useState(predefinedCategories);
  const [selectedId, setSelectedId] = useState(selectedCategoryId);

  useEffect(() => {
    if (visible) {
      setSelectedId(selectedCategoryId);
    }
  }, [visible, selectedCategoryId]);

  const handleSelectCategory = (category) => {
    setSelectedId(category.id);
    onSelectCategory(category);
    onClose();
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedId === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => handleSelectCategory(item)}
    >
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryColorDot, { backgroundColor: item.color }]} />
        <Text style={[
          styles.categoryName,
          selectedId === item.id && styles.selectedCategoryName
        ]}>
          {item.name}
        </Text>
      </View>
      {selectedId === item.id && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Category</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            style={styles.categoryList}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#faf8f3',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  categoryList: {
    padding: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedCategoryItem: {
    borderColor: '#20B2AA',
    backgroundColor: '#f0f9ff',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  selectedCategoryName: {
    color: '#20B2AA',
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#20B2AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});
