import React from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { Card, Button } from '@schedura/ui'
import { Crown, Calendar, CreditCard } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../auth/AuthProvider'
import { StripeService } from '../services/StripeService'

export const SubscriptionStatus = () => {
  const { subscription, loading, isPaid } = useSubscription()
  const { user } = useAuth()
  
  // Initialize Stripe service
  const stripeService = new StripeService()

  const handleManageBilling = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to manage billing')
      return
    }

    try {
      const returnUrl = process.env.EXPO_PUBLIC_APP_URL || 'schedura://'
      const billingPortalSession = await stripeService.createBillingPortalSession(returnUrl)
      
      Alert.alert(
        'Billing Portal',
        'This will open the Stripe billing portal where you can manage your subscription.',
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
      console.error('Error opening billing portal:', error)
      Alert.alert('Error', 'Failed to open billing portal. Please try again.')
    }
  }

  const handleUpgrade = () => {
    // Navigate to pricing screen
    // This would be handled by your navigation system
    Alert.alert('Upgrade', 'This would navigate to the pricing screen')
  }

  if (loading) {
    return (
      <Card style={styles.card}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading subscription...</Text>
        </View>
      </Card>
    )
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Crown 
            size={24} 
            color={isPaid ? '#007AFF' : '#8E8E93'} 
          />
          <View style={styles.titleTextContainer}>
            <Text style={styles.planName}>
              {subscription?.plan_name || 'Free'} Plan
            </Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: subscription?.status === 'active' ? '#34C759' : '#8E8E93' }
            ]}>
              <Text style={styles.statusText}>
                {subscription?.status || 'inactive'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {subscription?.current_period_end && (
        <View style={styles.periodContainer}>
          <Calendar size={16} color="#8E8E93" />
          <Text style={styles.periodText}>
            {subscription.cancel_at_period_end ? 'Cancels' : 'Renews'} on{' '}
            {new Date(subscription.current_period_end).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {isPaid ? (
          <Button
            variant="outline"
            onPress={handleManageBilling}
            style={styles.button}
          >
            <CreditCard size={16} color="#007AFF" />
            <Text style={styles.buttonText}>Manage Billing</Text>
          </Button>
        ) : (
          <Button
            onPress={handleUpgrade}
            style={styles.button}
          >
            <Crown size={16} color="white" />
            <Text style={[styles.buttonText, { color: 'white' }]}>Upgrade Plan</Text>
          </Button>
        )}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
})
