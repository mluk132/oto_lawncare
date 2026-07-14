import { Account, Device, DeviceZone } from '../../src/models/types';

export interface SeedData {
  accounts: Account[];
  devices: Device[];
  zones: DeviceZone[];
}

export interface StoreState {
  accountsById: Record<string, Account>;
  devicesById: Record<string, Device>;
  zonesById: Record<string, DeviceZone>;
}
