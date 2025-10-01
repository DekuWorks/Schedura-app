import React from 'react'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native'
import { SubscriptionStatus } from '../src/components/SubscriptionStatus'
import { Button } from '@schedura/ui'
import { Settings, CreditCard, HelpCircle } from 'lucide-react'
import { useAuth } from '../src/auth/AuthProvider'
import { StripeService } from '../src/services/StripeService'

export default function Subscription() {
  const { user } = useAuth()
  
  // Initialize Stripe service
  const stripeService = new StripeService()

  const handleManageBilling = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to manage your subscription')
      return
    }

    try {
      const returnUrl = process.env.EXPO_PUBLIC_APP_URL || 'schedura://'
      const billingPortalSession = await stripeService.createBillingPortalSession(returnUrl)
      
      Alert.alert(
        'Billing Portal',
        'This will open the Stripe billing portal where you can update payment methods, view invoices, and manage your subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Portal', 
            onPress: async () => {
              try {
                await stripeService.openBillingPortal(billingPortalSession.url)
              } catch (error) {
                Alert.alert('Error', 'Failed to open billing portal. Please try again.')
              }
            }
          }
        ]
      )
    } catch (error) {
      console.error('Error creating billing portal session:', error)
      Alert.alert('Error', 'Failed to open billing portal. Please try again.')
    }
  }

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'This would open your email client to contact support.',
      [{ text: 'OK' }]
    )
  }

  const handleViewInvoices = () => {
    Alert.alert(
      'Invoices',
      'This would show your billing history and invoices.',
      [{ text: 'OK' }]
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscription</Text>
        <Text style={styles.subtitle}>Manage your subscription and billing</Text>
      </View>

      <SubscriptionStatus />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billing & Payments</Text>
        
        <Button
          variant="outline"
          onPress={handleManageBilling}
          style={styles.actionButton}
        >
          <CreditCard size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Manage Billing</Text>
        </Button>

        <Button
          variant="outline"
          onPress={handleViewInvoices}
          style={styles.actionButton}
        >
          <Settings size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>View Invoices</Text>
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <Button
          variant="outline"
          onPress={handleContactSupport}
          style={styles.actionButton}
        >
          <HelpCircle size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Contact Support</Text>
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Need help with your subscription? Our support team is here to help.
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
})
