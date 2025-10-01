import { View, Text, StyleSheet } from 'react-native'
import { Button } from '@schedura/ui'
import { useAuth } from '../src/auth/AuthProvider'

export default function SignIn() {
  const { signIn } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Schedura</Text>
      <Text style={styles.subtitle}>Sign in to get started</Text>
      <Button onPress={signIn} style={styles.button}>
        Sign In
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  button: {
    width: '100%',
  },
})
