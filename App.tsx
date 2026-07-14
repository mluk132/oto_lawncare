import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>OtO React Native Interview</Text>
      <Text style={styles.subtitle}>Build your solution here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c2430',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#5a6575',
  },
});
