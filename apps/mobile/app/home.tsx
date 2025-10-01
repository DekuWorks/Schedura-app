import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Button, Card } from '@schedura/ui'
import { SubscriptionStatus } from '../src/components/SubscriptionStatus'
import { useAuth } from '../src/auth/AuthProvider'
import { useSubscription } from '../src/hooks/useSubscription'
import { Crown, Calendar, Settings } from 'lucide-react'
import { router } from 'expo-router'

export default function Home() {
  const { user, signOut } = useAuth()
  const { plan, isPaid } = useSubscription()

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const handleManageSubscription = () => {
    router.push('/subscription')
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>{user?.email}</Text>
      </View>
      
      <SubscriptionStatus />
      
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Your Schedule</Text>
        <Text style={styles.cardText}>No events scheduled</Text>
      </Card>

      {!isPaid && (
        <Card style={styles.upgradeCard}>
          <View style={styles.upgradeHeader}>
            <Crown size={24} color="#FF9500" />
            <Text style={styles.upgradeTitle}>Unlock Premium Features</Text>
          </View>
          <Text style={styles.upgradeText}>
            Get unlimited tasks, AI suggestions, and more with a Pro or Premium plan.
          </Text>
          <Button onPress={handleUpgrade} style={styles.upgradeButton}>
            <Crown size={16} color="white" />
            <Text style={styles.upgradeButtonText}>View Plans</Text>
          </Button>
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          variant="outline"
          onPress={handleManageSubscription}
          style={styles.actionButton}
        >
          <Settings size={16} color="#007AFF" />
          <Text style={styles.actionButtonText}>Manage Subscription</Text>
        </Button>
        
        <Button onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </Button>
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
    padding: 20,
    paddingBottom: 16,
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
  },
  card: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  upgradeCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 12,
  },
  upgradeText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FF9500',
  },
  upgradeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  actions: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  signOutButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})
