import React, { createContext, useContext, useEffect, useState } from 'react'
import { createApiClient, type User } from '@schedura/api-sdk'
import * as SecureStore from 'expo-secure-store'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock API client - replace with real implementation
  const api = createApiClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token')
      if (token) {
        // In a real app, you'd validate the token and get user info
        setUser({
          id: '1',
          email: 'user@example.com',
          name: 'Test User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async () => {
    try {
      // Mock sign in - replace with real OAuth flow
      await SecureStore.setItemAsync('auth_token', 'mock_token')
      setUser({
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token')
      setUser(null)
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
