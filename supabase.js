import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your actual Supabase project details from Lovable
const supabaseUrl = 'https://ywwlxczxktoqhjehitds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3d2x4Y3p4a3RvcWhqZWhpdGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzY0MjgsImV4cCI6MjA3NDgxMjQyOH0.fcutCL0FYL0JBta6BPw3_GbEWLJfqUcu_SLxukqXAZs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
