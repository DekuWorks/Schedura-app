import { Redirect } from 'expo-router'
import { useAuth } from '../src/auth/AuthProvider'

export default function Index() {
  const { user, loading } = useAuth()

  if (loading) {
    return null // You could show a loading spinner here
  }

  if (user) {
    return <Redirect href="/home" />
  }

  return <Redirect href="/sign-in" />
}
