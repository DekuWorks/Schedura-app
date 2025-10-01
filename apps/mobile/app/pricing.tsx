import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native'
import { PricingCard, PricingPlan } from '../src/components/PricingCard'
import { useAuth } from '../src/auth/AuthProvider'
import { StripeService } from '../src/services/StripeService'

const plans: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Up to 10 tasks per month',
      'Basic task scheduling',
      'Calendar view',
      'Manual task input',
    ],
    priceId: null,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: 'month',
    description: 'For productive individuals',
    features: [
      'Unlimited tasks',
      'AI-powered suggestions',
      'File upload & parsing',
      'Google Calendar sync',
      'Priority support',
    ],
    priceId: 'price_1SDPSRJd5wbPvQ1IjHVI6PO0',
    popular: true,
  },
  {
    name: 'Premium',
    price: '$19.99',
    period: 'month',
    description: 'For teams and power users',
    features: [
      'Everything in Pro',
      'Team workspaces',
      'Advanced analytics',
      'Custom integrations',
      'White-label option',
      '24/7 dedicated support',
    ],
    priceId: 'price_1SDPX7Jd5wbPvQ1I7kGQYsxS',
  },
]

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useAuth()
  
  // Initialize Stripe service
  const stripeService = new StripeService()

  const handleSubscribe = async (priceId: string | null, planName: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe to a plan')
      return
    }

    if (!priceId) {
      Alert.alert('Free Plan', 'You are already on the free plan')
      return
    }

    setLoading(planName)

    try {
      const successUrl = `${process.env.EXPO_PUBLIC_APP_URL || 'schedura://'}/success`
      const cancelUrl = `${process.env.EXPO_PUBLIC_APP_URL || 'schedura://'}/cancel`
      
      const checkoutSession = await stripeService.createCheckoutSession(
        priceId,
        successUrl,
        cancelUrl
      )

      Alert.alert(
        'Redirect to Checkout',
        `This will open Stripe checkout for ${planName} plan in your browser.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: async () => {
              try {
                await stripeService.openCheckout(checkoutSession.url)
              } catch (error) {
                Alert.alert('Error', 'Failed to open checkout. Please try again.')
              }
            }
          }
        ]
      )
    } catch (error) {
      console.error('Error creating checkout session:', error)
      Alert.alert('Error', 'Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Select the perfect plan for your productivity needs
        </Text>
      </View>

      {plans.map((plan) => (
        <PricingCard
          key={plan.name}
          plan={plan}
          onSubscribe={handleSubscribe}
          loading={loading === plan.name}
        />
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          All plans include a 14-day money-back guarantee
        </Text>
        <Text style={styles.contactText}>
          Need a custom plan?{' '}
          <Text style={styles.contactLink}>Contact us</Text>
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  contactLink: {
    color: '#007AFF',
    fontWeight: '500',
  },
})
