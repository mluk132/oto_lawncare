import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useDashboard } from '../hooks/useDashboard';

interface Props {
  /** Called when the user taps a device card. */
  onSelectDevice: (id: string) => void;
}

/**
 * Dashboard screen — shows the authenticated user's account header and a list
 * of their irrigation devices. Handles loading, error, refresh, and offline
 * device styling.
 */
export function DashboardScreen({ onSelectDevice }: Props) {
  const { account, devices, isLoading, isRefreshing, error, refresh } = useDashboard();

  if (isLoading) {
    return (
      <View
        style={styles.centered}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading dashboard"
      >
        <ActivityIndicator size="large" color="#4CD964" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered} accessibilityRole="alert">
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={refresh}
          accessibilityRole="button"
          accessibilityLabel="Retry loading dashboard"
        >
          <Text style={styles.retryButtonText}>Retry Setup</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Account header — user name + location. */}
      <View
        style={styles.header}
        accessible
        accessibilityRole="header"
        accessibilityLabel={
          account ? `Welcome back ${account.name}, located in ${account.city}` : undefined
        }
      >
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.accountName}>{account?.name}</Text>
        <Text style={styles.accountLocation}>📍 {account?.city}</Text>
      </View>

      {/* Device list — one card per device owned by the account. */}
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#4CD964" />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Your Irrigation Networks</Text>}
        renderItem={({ item }) => {
          const isOffline = item.connectivity === 'offline';
          return (
            <TouchableOpacity
              style={[styles.card, isOffline && styles.cardOffline]}
              onPress={() => onSelectDevice(item.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${item.connectivity}, ${item.zoneIds.length} zones, battery ${item.batteryLevel} percent`}
              accessibilityHint="Opens device detail"
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.deviceName, isOffline && styles.textOffline]}>
                  {item.name}
                </Text>
                <View
                  style={[styles.badge, isOffline ? styles.badgeOffline : styles.badgeOnline]}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                >
                  <Text style={styles.badgeText}>{item.connectivity.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.detailText}>💧 {item.zoneIds.length} Configured Zones</Text>
                <Text style={styles.detailText}>🔋 Battery Status: {item.batteryLevel}%</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { padding: 24, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#EAEAEA' },
  welcomeText: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
  accountName: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', marginTop: 2 },
  accountLocation: { fontSize: 14, color: '#63E2B7', fontWeight: '600', marginTop: 4 },
  listContent: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1C1C1E', marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EAEAEA' },
  cardOffline: { backgroundColor: '#FFF5F5', borderColor: '#FFD2D2' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deviceName: { fontSize: 18, fontWeight: '600', color: '#1C1C1E' },
  textOffline: { color: '#D63031' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeOnline: { backgroundColor: '#E4FBF2' },
  badgeOffline: { backgroundColor: '#FFEBEB' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#00D1B2' },
  cardDetails: { marginTop: 12, gap: 4 },
  detailText: { fontSize: 14, color: '#3A3A3C' },
  errorText: { fontSize: 16, color: '#D63031', textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#4CD964', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontWeight: '600' }
});
