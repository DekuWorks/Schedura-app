import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios, { AxiosInstance } from 'axios';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
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
  user_id: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export class ScheduraApi {
  private supabase: SupabaseClient;
  private axios: AxiosInstance;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.axios = axios.create({
      baseURL: `${supabaseUrl}/functions/v1`,
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Auth methods
  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  // User methods
  async getMe(): Promise<User | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  // Task methods
  async listTasks(params?: { 
    category_id?: string; 
    is_completed?: boolean; 
    limit?: number;
    offset?: number;
  }): Promise<Task[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    let query = this.supabase
      .from('tasks')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (params?.category_id) {
      query = query.eq('category_id', params.category_id);
    }

    if (params?.is_completed !== undefined) {
      query = query.eq('is_completed', params.is_completed);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createTask(taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('tasks')
      .insert({
        ...taskData,
        user_id: user.id,
      })
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await this.supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Category methods
  async listCategories(): Promise<Category[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createCategory(categoryData: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('categories')
      .insert({
        ...categoryData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // AI Functions (using Supabase Edge Functions)
  async suggestTasks(prompt: string): Promise<any> {
    const { data, error } = await this.axios.post('/ai-suggest-tasks', { prompt });
    if (error) throw error;
    return data;
  }

  async scheduleTasks(taskIds: string[]): Promise<any> {
    const { data, error } = await this.axios.post('/schedule-tasks', { task_ids: taskIds });
    if (error) throw error;
    return data;
  }

  async analyzeAvailability(): Promise<any> {
    const { data, error } = await this.axios.post('/analyze-availability');
    if (error) throw error;
    return data;
  }

  async analyzeImage(imageData: string): Promise<any> {
    const { data, error } = await this.axios.post('/analyze-image', { image_data: imageData });
    if (error) throw error;
    return data;
  }
}

// Create default instance with your Supabase credentials
export const api = new ScheduraApi(
  'https://ywwlxczxktoqhjehitds.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3d2x4Y3p4a3RvcWhqZWhpdGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzY0MjgsImV4cCI6MjA3NDgxMjQyOH0.fcutCL0FYL0JBta6BPw3_GbEWLJfqUcu_SLxukqXAZs'
);
