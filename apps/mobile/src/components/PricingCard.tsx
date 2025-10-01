import React from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { Card, Button } from '@schedura/ui'
import { Check, Crown } from 'lucide-react'

export interface PricingPlan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  priceId: string | null
  popular?: boolean
}

interface PricingCardProps {
  plan: PricingPlan
  onSubscribe: (priceId: string | null, planName: string) => void
  loading?: boolean
  isCurrentPlan?: boolean
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  onSubscribe,
  loading = false,
  isCurrentPlan = false
}) => {
  const handleSubscribe = () => {
    if (isCurrentPlan) {
      Alert.alert('Current Plan', 'You are already on this plan')
      return
    }
    onSubscribe(plan.priceId, plan.name)
  }

  return (
    <Card style={[
      styles.card,
      plan.popular && styles.popularCard
    ]}>
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{plan.price}</Text>
          <Text style={styles.period}>/{plan.period}</Text>
        </View>
        <Text style={styles.description}>{plan.description}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Check size={16} color="#34C759" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Button
        onPress={handleSubscribe}
        disabled={loading || isCurrentPlan}
        style={[
          styles.subscribeButton,
          plan.popular && styles.popularButton,
          isCurrentPlan && styles.currentPlanButton
        ]}
      >
        {loading ? (
          <Text style={styles.buttonText}>Loading...</Text>
        ) : isCurrentPlan ? (
          <Text style={styles.buttonText}>Current Plan</Text>
        ) : plan.priceId ? (
          <>
            <Crown size={16} color={plan.popular ? 'white' : '#007AFF'} />
            <Text style={[
              styles.buttonText,
              { color: plan.popular ? 'white' : '#007AFF' }
            ]}>
              Subscribe Now
            </Text>
          </>
        ) : (
          <Text style={styles.buttonText}>Get Started</Text>
        )}
      </Button>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowOpacity: 0.15,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -60,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  period: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#1C1C1E',
    flex: 1,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
  },
  popularButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  currentPlanButton: {
    backgroundColor: '#F2F2F7',
    borderColor: '#C7C7CC',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
})
