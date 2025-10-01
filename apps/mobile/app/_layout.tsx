import { Stack } from 'expo-router'
import { AuthProvider } from '../src/auth/AuthProvider'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Schedura' }} />
        <Stack.Screen name="sign-in" options={{ title: 'Sign In' }} />
        <Stack.Screen name="home" options={{ title: 'Home' }} />
        <Stack.Screen name="pricing" options={{ title: 'Pricing' }} />
        <Stack.Screen name="subscription" options={{ title: 'Subscription' }} />
      </Stack>
    </AuthProvider>
  )
}
