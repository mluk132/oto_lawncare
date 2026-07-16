// src/api/endpoints.ts
//
// Typed wrappers around the mock `/api` surface. Each function returns a
// strongly-typed model from `src/models/types.ts` so callers never touch
// the untyped HTTP layer directly.

import { client } from './client';
import type { Account, Device, DeviceZone, UpdateDeviceInput } from '../models/types';

export const api = {
  /** `GET /api/accounts/:accountId` — fetch the authenticated account. */
  getAccount: async (accountId: string): Promise<Account> => {
    return client.get(`accounts/${accountId}`);
  },

  /** `GET /api/accounts/:accountId/devices` — list devices owned by an account. */
  getAccountDevices: async (accountId: string): Promise<Device[]> => {
    return client.get(`accounts/${accountId}/devices`);
  },

  /** `GET /api/devices/:deviceId` — fetch a single device by id. */
  getDeviceById: async (deviceId: string): Promise<Device> => {
    return client.get(`devices/${deviceId}`);
  },

  /** `GET /api/devices/:deviceId/zones` — list the irrigation zones for a device. */
  getDeviceZones: async (deviceId: string): Promise<DeviceZone[]> => {
    return client.get(`devices/${deviceId}/zones`);
  },

  /**
   * `PATCH /api/devices/:deviceId` — update the device name.
   * The server rejects empty names with a 400 which surfaces as an `ApiError`.
   */
  updateDevice: async (deviceId: string, input: UpdateDeviceInput): Promise<Device> => {
    return client.patch(`devices/${deviceId}`, input);
  },
};