import { useEffect, useState } from 'react'
import { createApiClient } from '@schedura/api-sdk'

export interface Subscription {
  plan_name: string
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      // In a real implementation, you'd call your API here
      // For now, we'll use a mock implementation
      const mockSubscription: Subscription = {
        plan_name: 'free',
        status: 'inactive',
        current_period_end: null,
        cancel_at_period_end: false
      }
      
      setSubscription(mockSubscription)
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setSubscription({
        plan_name: 'free',
        status: 'inactive',
        current_period_end: null,
        cancel_at_period_end: false
      })
    } finally {
      setLoading(false)
    }
  }

  const isPaid = subscription?.plan_name !== 'free' && subscription?.status === 'active'
  const plan = subscription?.plan_name || 'free'

  return { 
    subscription, 
    loading, 
    isPaid, 
    plan,
    refetch: fetchSubscription 
  }
}
