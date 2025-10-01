import { View, Text, StyleSheet, Platform } from 'react-native';
import { useEffect } from 'react';

export default function HomeScreen() {
  useEffect(() => {
    // Redirect to web app for now
    if (Platform.OS === 'web') {
      window.location.href = '/';
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedura App</Text>
      <Text style={styles.subtitle}>Your smart scheduling assistant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
