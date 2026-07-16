// src/App.tsx
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { DeviceDetailScreen } from './src/screens/DeviceDetailsScreen';

/**
 * Root component.
 *
 * Uses a `useState` toggle for navigation between two screens. In a larger
 * app this would be replaced with `@react-navigation/native-stack` for
 * typed route params, deep links, and browser back-button support.
 */
export default function App() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar barStyle="dark-content" />
      {selectedDeviceId ? (
        <DeviceDetailScreen
          deviceId={selectedDeviceId}
          onBack={() => setSelectedDeviceId(null)}
        />
      ) : (
        <DashboardScreen onSelectDevice={(id) => setSelectedDeviceId(id)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});