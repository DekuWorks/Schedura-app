import { createClient } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ApiClient {
  getMe(): Promise<User | null>
  listEvents(): Promise<Event[]>
  createEvent(event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Event>
  updateEvent(id: string, event: Partial<Event>): Promise<Event>
  deleteEvent(id: string): Promise<void>
}

class ScheduraApiClient implements ApiClient {
  private supabase: any

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async getMe(): Promise<User | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error || !user) return null
    
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  }

  async listEvents(): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true })

    if (error) throw new Error(`Failed to fetch events: ${error.message}`)
    return data || []
  }

  async createEvent(event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase
      .from('events')
      .insert({
        ...event,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create event: ${error.message}`)
    return data
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    const { data, error } = await this.supabase
      .from('events')
      .update(event)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update event: ${error.message}`)
    return data
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete event: ${error.message}`)
  }
}

export function createApiClient(supabaseUrl: string, supabaseKey: string): ApiClient {
  return new ScheduraApiClient(supabaseUrl, supabaseKey)
}

export { ScheduraApiClient }
