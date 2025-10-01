import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import Calendar from './src/components/Calendar';
import CategoryManager from './src/components/CategoryManager';
import CategoryPicker from './src/components/CategoryPicker';
import { supabase } from './supabase';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  duration_minutes?: number;
  start_time?: string;
  end_time?: string;
  is_scheduled: boolean;
  is_completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

function MainApp() {
  const { user, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'calendar' | 'availability'>('calendar');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    duration_minutes: 30,
    start_time: '',
    end_time: '',
    notes: ''
  });
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Work', color: '#4ECDC4' },
    { id: '2', name: 'Personal', color: '#FF6B6B' },
    { id: '3', name: 'Health', color: '#96CEB4' },
    { id: '4', name: 'Learning', color: '#FFEAA7' },
    { id: '5', name: 'Finance', color: '#DDA0DD' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Tasks');

  // Load tasks from Supabase
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description || null,
        priority: newTask.priority,
        duration_minutes: newTask.duration_minutes,
        start_time: newTask.start_time || null,
        end_time: newTask.end_time || null,
        is_scheduled: false,
        is_completed: false,
        notes: newTask.notes || null,
        user_id: user.id,
        category: selectedCategory,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select();

      if (error) {
        Alert.alert('Error', 'Failed to create task');
        console.error('Error creating task:', error);
        return;
      }

      setTasks([data[0], ...tasks]);
      setNewTask({ 
        title: '', 
        description: '', 
        priority: 'medium', 
        duration_minutes: 30, 
        start_time: '', 
        end_time: '', 
        notes: '' 
      });
      setSelectedCategory(null as Category | null);
      setShowAddTask(false);
      Alert.alert('Success', 'Task created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
      console.error('Error creating task:', error);
    }
  };

  const filteredTasks = selectedCategoryFilter === 'All Tasks' 
    ? tasks 
    : tasks.filter(task => task.category?.name === selectedCategoryFilter);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleScheduleAll = async () => {
    if (tasks.length === 0) {
      Alert.alert('No Tasks', 'Please add some tasks first before scheduling.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Here you would call your AI scheduling function
      // For now, we'll just show a success message
      setTimeout(() => {
        Alert.alert('Success', 'AI has scheduled all your tasks! Check the calendar view.');
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule tasks');
      setIsLoading(false);
    }
  };

  const handleGetAISuggestions = async () => {
    if (!aiSuggestion.trim()) {
      Alert.alert('Error', 'Please describe what you need to do first.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Here you would call your AI suggestions function
      // For now, we'll simulate the response
      setTimeout(() => {
        const suggestedTasks = [
          'Prepare presentation slides',
          'Review project requirements',
          'Schedule team meeting',
          'Research competitor analysis'
        ];
        
        Alert.alert(
          'AI Suggestions',
          `Based on your input, here are some suggested tasks:\n\n${suggestedTasks.join('\n')}\n\nWould you like to add these to your task list?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Add All', 
              onPress: () => {
                suggestedTasks.forEach((task, index) => {
                  const newTaskItem = {
                    title: task,
                    description: '',
                    priority: 'medium' as 'low' | 'medium' | 'high',
                    duration_minutes: 30,
                    start_time: '',
                    end_time: '',
                    notes: ''
                  };
                  // Add task to database (simplified for demo)
                  console.log('Adding task:', task);
                });
                Alert.alert('Success', 'All suggested tasks have been added!');
                setAiSuggestion('');
              }
            }
          ]
        );
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to get AI suggestions');
      setIsLoading(false);
    }
  };

  const handleUpgradePremium = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Premium features include:\n• AI Image Scanner\n• Advanced scheduling\n• Priority support\n• Unlimited tasks\n\nWould you like to upgrade?',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Upgrade', onPress: () => Alert.alert('Coming Soon', 'Premium upgrade will be available soon!') }
      ]
    );
  };

  const handleAddCategory = () => {
    setShowCategoryManager(true);
  };

  const handleCategoryAdded = (newCategory: Category) => {
    setCategories(prev => [...prev, newCategory]);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show auth screen if user is not logged in
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>📅</Text>
          <View>
            <Text style={styles.headerTitle}>Schedura</Text>
            <Text style={styles.headerSubtitle}>Smart Task Scheduling</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert('Auto Mode', 'Auto mode will automatically schedule tasks based on your preferences and availability.')}
          >
            <Text style={styles.headerButtonText}>Auto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleSignOut}>
            <Text style={styles.headerButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* AI Task Scheduler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>✨</Text>
            <Text style={styles.sectionTitle}>AI Task Scheduler</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Automatically find optimal time slots for your tasks
          </Text>
          <View style={styles.sectionStatus}>
            <Text style={styles.statusText}>{tasks.length} unscheduled tasks</Text>
            <Text style={styles.statusSubtext}>
              AI will find the best times based on your calendar
            </Text>
          </View>
              <TouchableOpacity 
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handleScheduleAll}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Scheduling...' : 'Schedule All'}
                </Text>
              </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💎</Text>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={['All Tasks', ...categories.map(cat => cat.name)]}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const category = categories.find(cat => cat.name === item);
              const isSelected = selectedCategoryFilter === item;
              
              return (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategoryFilter(item)}
                >
                  {category && (
                    <View style={[styles.categoryColorIndicator, { backgroundColor: category.color }]} />
                  )}
                  <Text style={[
                    styles.categoryButtonText,
                    isSelected && styles.categoryButtonTextActive
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item}
          />
        </View>

        {/* AI Task Suggestions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>✨</Text>
            <Text style={styles.sectionTitle}>AI Task Suggestions</Text>
          </View>
          <TextInput
            style={styles.suggestionInput}
            placeholder="Describe what you need to do... (e.g., 'I have a project deadline next week and need to prepare a presentation')"
            multiline
            numberOfLines={3}
            value={aiSuggestion}
            onChangeText={setAiSuggestion}
          />
          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
            onPress={handleGetAISuggestions}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Getting Suggestions...' : 'Get AI Suggestions'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Image Scanner */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📷</Text>
            <Text style={styles.sectionTitle}>AI Image Scanner</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Upgrade to Premium to scan images and automatically extract calendar events!
          </Text>
          <TouchableOpacity style={styles.premiumButton} onPress={handleUpgradePremium}>
            <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tasks ({filteredTasks.length})</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddTask(true)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          
          {filteredTasks.length === 0 ? (
            <Text style={styles.emptyText}>
              No tasks yet. Add your first task to get started!
            </Text>
          ) : (
            <FlatList
              data={filteredTasks}
                  renderItem={({ item }) => (
                    <View style={styles.taskItem}>
                      <View style={styles.taskHeader}>
                        <Text style={styles.taskTitle}>{item.title}</Text>
                        {item.category && (
                          <View style={styles.taskCategory}>
                            <View style={[styles.taskCategoryDot, { backgroundColor: item.category.color }]} />
                            <Text style={styles.taskCategoryText}>{item.category.name}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.taskDetails}>
                        {item.duration_minutes || 30} min • {item.priority} priority
                      </Text>
                      {item.description && (
                        <Text style={styles.taskDescription}>{item.description}</Text>
                      )}
                    </View>
                  )}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>

        {/* Calendar/Availability Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'calendar' && styles.toggleButtonActive]}
            onPress={() => setActiveTab('calendar')}
          >
            <Text style={[styles.toggleButtonText, activeTab === 'calendar' && styles.toggleButtonTextActive]}>
              Calendar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'availability' && styles.toggleButtonActive]}
            onPress={() => setActiveTab('availability')}
          >
            <Text style={[styles.toggleButtonText, activeTab === 'availability' && styles.toggleButtonTextActive]}>
              Availability
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <Calendar 
            tasks={tasks as any}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        )}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={showAddTask}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            
                <TextInput
                  style={styles.input}
                  placeholder="Task Title"
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({...newTask, title: text})}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Description (optional)"
                  value={newTask.description}
                  onChangeText={(text) => setNewTask({...newTask, description: text})}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Priority (low/medium/high)"
                  value={newTask.priority}
                  onChangeText={(text) => setNewTask({...newTask, priority: text as 'low' | 'medium' | 'high'})}
                />

                <TouchableOpacity
                  style={styles.categorySelector}
                  onPress={() => setShowCategoryPicker(true)}
                >
                  <View style={styles.categorySelectorContent}>
                    <Text style={styles.categorySelectorLabel}>Category:</Text>
                    {selectedCategory ? (
                      <View style={styles.selectedCategoryDisplay}>
                        <View style={[styles.selectedCategoryDot, { backgroundColor: selectedCategory.color }]} />
                        <Text style={styles.selectedCategoryText}>{selectedCategory.name}</Text>
                      </View>
                    ) : (
                      <Text style={styles.categorySelectorPlaceholder}>Select Category</Text>
                    )}
                  </View>
                  <Text style={styles.categorySelectorArrow}>▼</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  placeholder="Duration (minutes)"
                  value={newTask.duration_minutes.toString()}
                  onChangeText={(text) => setNewTask({...newTask, duration_minutes: parseInt(text) || 30})}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Start Time (optional)"
                  value={newTask.start_time}
                  onChangeText={(text) => setNewTask({...newTask, start_time: text})}
                />

                <TextInput
                  style={styles.input}
                  placeholder="End Time (optional)"
                  value={newTask.end_time}
                  onChangeText={(text) => setNewTask({...newTask, end_time: text})}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Notes (optional)"
                  value={newTask.notes}
                  onChangeText={(text) => setNewTask({...newTask, notes: text})}
                  multiline
                  numberOfLines={2}
                />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddTask(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addTask}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
          </Modal>

          {/* Category Manager Modal */}
          <CategoryManager
            visible={showCategoryManager}
            onClose={() => setShowCategoryManager(false)}
            onCategoryAdded={handleCategoryAdded}
          />

          {/* Category Picker Modal */}
          <CategoryPicker
            visible={showCategoryPicker}
            onClose={() => setShowCategoryPicker(false)}
            onSelectCategory={setSelectedCategory}
            selectedCategoryId={selectedCategory?.id || null}
          />
        </View>
      );
    }

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f1e8',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f1e8',
  },
  header: {
    backgroundColor: '#faf8f3',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  headerButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#faf8f3',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  sectionStatus: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  statusSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#20B2AA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addButton: {
    backgroundColor: '#20B2AA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#20B2AA',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  suggestionInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 80,
  },
  premiumButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 40,
  },
  taskItem: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  taskDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  taskDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCategoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  taskCategoryText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categorySelector: {
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
  categorySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categorySelectorLabel: {
    fontSize: 16,
    color: '#111827',
    marginRight: 12,
  },
  selectedCategoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategoryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  selectedCategoryText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  categorySelectorPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  categorySelectorArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#20B2AA',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
  calendarSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarDateRange: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  calendarControls: {
    flexDirection: 'row',
    gap: 8,
  },
  calendarButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  calendarButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  calendarNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  navButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  todayButton: {
    backgroundColor: '#20B2AA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  todayButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  calendarGrid: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
  },
  calendarPlaceholder: {
    fontSize: 24,
    marginBottom: 8,
  },
  calendarSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
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
  saveButton: {
    flex: 1,
    backgroundColor: '#20B2AA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
