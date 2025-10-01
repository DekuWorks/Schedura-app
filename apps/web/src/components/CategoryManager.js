import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { supabase } from '../../supabase';

const predefinedColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
  '#A9DFBF', '#F9E79F', '#D5DBDB', '#AED6F1', '#FADBD8'
];

export default function CategoryManager({ visible, onClose, onCategoryAdded }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#4ECDC4'
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, we'll use local storage since we don't have workspace_id in the mobile app
      // In a full implementation, you'd fetch from the task_categories table
      const localCategories = [
        { id: '1', name: 'Work', color: '#4ECDC4' },
        { id: '2', name: 'Personal', color: '#FF6B6B' },
        { id: '3', name: 'Health', color: '#96CEB4' },
        { id: '4', name: 'Learning', color: '#FFEAA7' },
        { id: '5', name: 'Finance', color: '#DDA0DD' },
      ];
      setCategories(localCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategory.name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    setLoading(true);
    try {
      const categoryData = {
        id: editingCategory ? editingCategory.id : Date.now().toString(),
        name: newCategory.name.trim(),
        color: newCategory.color,
      };

      if (editingCategory) {
        // Update existing category
        setCategories(prev => 
          prev.map(cat => cat.id === editingCategory.id ? categoryData : cat)
        );
        Alert.alert('Success', 'Category updated successfully!');
      } else {
        // Add new category
        setCategories(prev => [...prev, categoryData]);
        Alert.alert('Success', 'Category added successfully!');
        onCategoryAdded(categoryData);
      }

      setNewCategory({ name: '', color: '#4ECDC4' });
      setEditingCategory(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, color: category.color });
    setShowColorPicker(false);
  };

  const handleDeleteCategory = (category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCategories(prev => prev.filter(cat => cat.id !== category.id));
            Alert.alert('Success', 'Category deleted successfully!');
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    setNewCategory({ name: '', color: '#4ECDC4' });
    setEditingCategory(null);
    setShowColorPicker(false);
    onClose();
  };

  const renderColorPicker = () => (
    <Modal
      visible={showColorPicker}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.colorPickerOverlay}>
        <View style={styles.colorPickerContainer}>
          <Text style={styles.colorPickerTitle}>Choose Color</Text>
          
          <View style={styles.colorGrid}>
            {predefinedColors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newCategory.color === color && styles.selectedColorOption
                ]}
                onPress={() => {
                  setNewCategory(prev => ({ ...prev, color }));
                  setShowColorPicker(false);
                }}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowColorPicker(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderCategory = ({ item }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryColorIndicator, { backgroundColor: item.color }]} />
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
      
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditCategory(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCategory(item)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
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
            <Text style={styles.title}>
              {editingCategory ? 'Edit Category' : 'Manage Categories'}
            </Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Category Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Category name"
                value={newCategory.name}
                onChangeText={(text) => setNewCategory(prev => ({ ...prev, name: text }))}
              />

              <TouchableOpacity
                style={styles.colorSelector}
                onPress={() => setShowColorPicker(true)}
              >
                <View style={styles.colorPreview}>
                  <View style={[styles.colorDot, { backgroundColor: newCategory.color }]} />
                  <Text style={styles.colorText}>Color: {newCategory.color}</Text>
                </View>
                <Text style={styles.colorSelectorText}>Choose Color</Text>
              </TouchableOpacity>

              <View style={styles.formButtons}>
                {editingCategory && (
                  <TouchableOpacity
                    style={styles.cancelFormButton}
                    onPress={() => {
                      setEditingCategory(null);
                      setNewCategory({ name: '', color: '#4ECDC4' });
                    }}
                  >
                    <Text style={styles.cancelFormButtonText}>Cancel Edit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                  onPress={handleSaveCategory}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Add')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Existing Categories */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Existing Categories</Text>
              {categories.length === 0 ? (
                <Text style={styles.emptyText}>No categories yet</Text>
              ) : (
                <FlatList
                  data={categories}
                  renderItem={renderCategory}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {renderColorPicker()}
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
    maxHeight: '90%',
    minHeight: '60%',
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
  content: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  colorSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  colorText: {
    fontSize: 16,
    color: '#111827',
  },
  colorSelectorText: {
    fontSize: 16,
    color: '#20B2AA',
    fontWeight: '500',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelFormButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelFormButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#20B2AA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  categoriesSection: {
    marginBottom: 20,
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
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColorIndicator: {
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
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#20B2AA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  colorPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerContainer: {
    backgroundColor: '#faf8f3',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#20B2AA',
    transform: [{ scale: 1.2 }],
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});
