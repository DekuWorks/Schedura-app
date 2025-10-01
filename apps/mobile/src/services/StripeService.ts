import { createApiClient } from '@schedura/api-sdk'
import { Alert, Linking } from 'react-native'

export interface CheckoutSession {
  sessionId: string
  url: string
}

export interface BillingPortalSession {
  url: string
}

export class StripeService {
  private api: any

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    const url = supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || ''
    const key = supabaseKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
    this.api = createApiClient(url, key)
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession> {
    try {
      // In a real implementation, you'd call your Supabase function here
      // For now, we'll simulate the API call
      const mockResponse = {
        sessionId: `cs_test_${Math.random().toString(36).substr(2, 9)}`,
        url: `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substr(2, 9)}`
      }

      console.log('Creating checkout session for priceId:', priceId)
      return mockResponse
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw new Error('Failed to create checkout session')
    }
  }

  /**
   * Create a billing portal session for subscription management
   */
  async createBillingPortalSession(returnUrl: string): Promise<BillingPortalSession> {
    try {
      // In a real implementation, you'd call your Supabase function here
      // For now, we'll simulate the API call
      const mockResponse = {
        url: `https://billing.stripe.com/session/${Math.random().toString(36).substr(2, 9)}`
      }

      console.log('Creating billing portal session')
      return mockResponse
    } catch (error) {
      console.error('Error creating billing portal session:', error)
      throw new Error('Failed to create billing portal session')
    }
  }

  /**
   * Open checkout session in browser
   */
  async openCheckout(checkoutUrl: string): Promise<void> {
    try {
      const canOpen = await Linking.canOpenURL(checkoutUrl)
      if (canOpen) {
        await Linking.openURL(checkoutUrl)
      } else {
        Alert.alert('Error', 'Cannot open checkout URL')
      }
    } catch (error) {
      console.error('Error opening checkout:', error)
      Alert.alert('Error', 'Failed to open checkout')
    }
  }

  /**
   * Open billing portal in browser
   */
  async openBillingPortal(portalUrl: string): Promise<void> {
    try {
      const canOpen = await Linking.canOpenURL(portalUrl)
      if (canOpen) {
        await Linking.openURL(portalUrl)
      } else {
        Alert.alert('Error', 'Cannot open billing portal')
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
      Alert.alert('Error', 'Failed to open billing portal')
    }
  }

  /**
   * Handle successful payment redirect
   */
  async handlePaymentSuccess(sessionId: string): Promise<void> {
    try {
      // In a real implementation, you'd verify the session with your backend
      console.log('Payment successful for session:', sessionId)
      
      // You might want to refresh the user's subscription status here
      // await this.refreshSubscriptionStatus()
    } catch (error) {
      console.error('Error handling payment success:', error)
    }
  }

  /**
   * Handle canceled payment
   */
  async handlePaymentCancel(): Promise<void> {
    console.log('Payment canceled by user')
    // You might want to show a message or redirect to a specific screen
  }
}
