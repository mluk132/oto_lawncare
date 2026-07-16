// src/hooks/useDeviceDetail.ts
//
// Owns the async lifecycle for the device detail screen: initial fetch of
// device + zones, and the rename mutation with optimistic update + rollback
// on failure.

import { useState, useEffect } from 'react';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import type { Device, DeviceZone } from '../models/types';

/**
 * Loads a device and its zones, and exposes a `renameDevice` action that
 * optimistically updates the local state and rolls back if the PATCH fails.
 *
 * @param deviceId - The device to load. Refetches when this changes.
 */
export function useDeviceDetail(deviceId: string) {
  const [device, setDevice] = useState<Device | null>(null);
  const [zones, setZones] = useState<DeviceZone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [deviceData, zonesData] = await Promise.all([
          api.getDeviceById(deviceId),
          api.getDeviceZones(deviceId)
        ]);
        setDevice(deviceData);
        setZones(zonesData);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Error fetching details');
      } finally {
        setIsLoading(false);
      }
    };

    if (deviceId) fetchDetails();
  }, [deviceId]);

  /**
   * Rename the current device via `PATCH /api/devices/:id`.
   *
   * Uses an optimistic update: the UI shows the new name immediately, and
   * rolls back to the original name if the server rejects the request. The
   * returned boolean lets the caller close the edit form on success and
   * keep it open on failure.
   */
  const renameDevice = async (newName: string): Promise<boolean> => {
    if (!device || !newName.trim()) return false;

    setIsUpdating(true);
    setUpdateError(null);
    const originalDevice = { ...device };

    // Optimistic UI update — snappier interaction on mobile.
    setDevice({ ...device, name: newName });

    try {
      await api.updateDevice(deviceId, { name: newName });
      setIsUpdating(false);
      return true;
    } catch (err) {
      // Rollback if the server rejects the change.
      setDevice(originalDevice);
      setUpdateError(err instanceof ApiError ? err.message : 'Failed to update name');
      setIsUpdating(false);
      return false;
    }
  };

  return {
    device,
    zones,
    isLoading,
    isUpdating,
    error,
    updateError,
    renameDevice
  };
}