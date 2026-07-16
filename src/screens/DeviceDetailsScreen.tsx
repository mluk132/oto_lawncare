import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { useDeviceDetail } from '../hooks/useDeviceDetail';

interface Props {
  deviceId: string;
  onBack: () => void;
}

export function DeviceDetailScreen({ deviceId, onBack }: Props) {
  const { device, zones, isLoading, isUpdating, error, updateError, renameDevice } = useDeviceDetail(deviceId);
  const [nameInput, setNameInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    setNameInput(device?.name || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (nameInput.trim() && nameInput !== device?.name) {
      const success = await renameDevice(nameInput);
      if (success) setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={styles.centered}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading device details"
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !device) {
    return (
      <View style={styles.centered} accessibilityRole="alert">
        <Text style={styles.errorText}>{error || 'Device missing'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Return to dashboard"
        >
          <Text style={styles.backButtonText}>Return to Overview</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOffline = device.connectivity === 'offline';

  return (
    <View style={styles.container}>
      {/* Offline status bar — announced by screen readers via accessibilityLiveRegion. */}
      {isOffline && (
        <View
          style={styles.offlineStatusBar}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel="Controller is offline. Changes will sync when reconnected."
        >
          <Text style={styles.statusBarText}>⚠️ Controller Offline — Changes Sync Locally</Text>
        </View>
      )}

      {/* Header — back navigation + device name (or rename input). */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.textButton}
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
        >
          <Text style={styles.navigationText}>← Dashboard</Text>
        </TouchableOpacity>

        {isEditing ? (
          <View style={styles.editingContainer}>
            <TextInput
              style={styles.input}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              maxLength={30}
              accessibilityLabel="Device name"
              accessibilityHint="Enter a new name for the device"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <TouchableOpacity
              onPress={handleSave}
              disabled={isUpdating}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel={isUpdating ? 'Saving device name' : 'Save device name'}
              accessibilityState={{ disabled: isUpdating, busy: isUpdating }}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.titleContainer}>
            <Text
              style={[styles.mainTitle, isOffline && styles.offlineText]}
              accessibilityRole="header"
              accessibilityLabel={`${device.name}${isOffline ? ', offline' : ''}`}
            >
              {device.name}
            </Text>
            <TouchableOpacity
              style={styles.editBadge}
              onPress={startEditing}
              accessibilityRole="button"
              accessibilityLabel={`Rename ${device.name}`}
            >
              <Text style={styles.editBadgeText}>Rename</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {updateError && (
        <Text
          style={styles.inlineError}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {updateError}
        </Text>
      )}

      {/* Zones list — each zone announces its name and running state. */}
      <FlatList
        data={zones}
        keyExtractor={(zone) => zone.id}
        contentContainerStyle={styles.listPadding}
        ListHeaderComponent={<Text style={styles.sectionHeader}>System Partition Zones</Text>}
        renderItem={({ item }) => (
          <View
            style={[styles.zoneCard, isOffline && styles.zoneCardDisabled]}
            accessible
            accessibilityLabel={`${item.name}, ${item.isActive ? 'active and running' : 'idle'}`}
          >
            <View style={styles.zoneRow}>
              <Text style={styles.zoneName}>{item.name}</Text>
              <View
                style={[
                  styles.statusIndicator,
                  item.isActive ? styles.activeZone : styles.inactiveZone,
                ]}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            </View>
            <Text style={styles.zoneMetaStatus}>
              {item.isActive ? 'Active & Running' : 'Idle State'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  offlineStatusBar: { backgroundColor: '#FF9500', paddingVertical: 6, alignItems: 'center' },
  statusBarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#EAEAEA' },
  textButton: { marginBottom: 12 },
  navigationText: { color: '#007AFF', fontSize: 16, fontWeight: '500' },
  editingContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { flex: 1, borderBottomWidth: 2, borderColor: '#007AFF', fontSize: 22, fontWeight: '700', paddingVertical: 4 },
  actionButton: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  actionButtonText: { color: '#FFFFFF', fontWeight: '600' },
  titleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mainTitle: { fontSize: 24, fontWeight: '700', color: '#1C1C1E' },
  offlineText: { color: '#FF3B30' },
  editBadge: { backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  editBadgeText: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  inlineError: { color: '#FF3B30', paddingHorizontal: 20, paddingTop: 10, fontWeight: '500' },
  listPadding: { padding: 20 },
  sectionHeader: { fontSize: 16, fontWeight: '600', color: '#8E8E93', marginBottom: 12 },
  zoneCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#EAEAEA' },
  zoneCardDisabled: { borderColor: '#E5E5EA', backgroundColor: '#FAFAFA' },
  zoneRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  zoneName: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  statusIndicator: { width: 10, height: 10, borderRadius: 5 },
  activeZone: { backgroundColor: '#4CD964' },
  inactiveZone: { backgroundColor: '#C7C7CC' },
  zoneMetaStatus: { fontSize: 12, color: '#8E8E93', marginTop: 4 },
  errorText: { fontSize: 16, color: '#FF3B30', marginBottom: 16 },
  backButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8 },
  backButtonText: { color: '#FFFFFF', fontWeight: '600' }
});