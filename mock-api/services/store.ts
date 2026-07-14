import { Account, Device, DeviceZone } from '../../src/models/types';
import { SeedData, StoreState } from './types';

export interface Store {
  reset(seedData: SeedData): void;
  findAccountById(accountId: string): Account | undefined;
  listDevices(accountId: string): Device[];
  listZonesByDeviceId(deviceId: string): DeviceZone[];
  findDeviceById(deviceId: string): Device | undefined;
  findZoneById(zoneId: string): DeviceZone | undefined;
  saveDevice(device: Device): void;
}

export function cloneZone(zone: DeviceZone): DeviceZone {
  return { ...zone };
}

export function cloneZones(zones: DeviceZone[]): DeviceZone[] {
  return zones.map(cloneZone);
}

export function cloneDevice(device: Device): Device {
  return {
    ...device,
    zoneIds: [...device.zoneIds],
  };
}

export function cloneDevices(devices: Device[]): Device[] {
  return devices.map(cloneDevice);
}

export function cloneAccount(account: Account): Account {
  return {
    ...account,
    deviceIds: [...account.deviceIds],
  };
}

export function cloneAccounts(accounts: Account[]): Account[] {
  return accounts.map(cloneAccount);
}

function createStoreState(seedData: SeedData): StoreState {
  const accounts = cloneAccounts(seedData.accounts);
  const devices = cloneDevices(seedData.devices);
  const zones = cloneZones(seedData.zones);

  return {
    accountsById: Object.fromEntries(
      accounts.map((account) => [account.id, account]),
    ),
    devicesById: Object.fromEntries(
      devices.map((device) => [device.id, device]),
    ),
    zonesById: Object.fromEntries(zones.map((zone) => [zone.id, zone])),
  };
}

export function createInMemoryStore(seedData: SeedData): Store {
  let state = createStoreState(seedData);

  return {
    reset(nextSeedData) {
      state = createStoreState(nextSeedData);
    },
    findAccountById(accountId) {
      const account = state.accountsById[accountId];
      return account ? cloneAccount(account) : undefined;
    },
    listDevices(accountId) {
      const account = state.accountsById[accountId];
      return account
        ? account.deviceIds
            .map((deviceId) => state.devicesById[deviceId])
            .filter((device): device is Device => Boolean(device))
            .map(cloneDevice)
        : [];
    },
    listZonesByDeviceId(deviceId) {
      const device = state.devicesById[deviceId];
      if (!device) {
        return [];
      }

      return device.zoneIds
        .map((zoneId) => state.zonesById[zoneId])
        .filter((zone): zone is DeviceZone => Boolean(zone))
        .map(cloneZone);
    },
    findDeviceById(deviceId) {
      const device = state.devicesById[deviceId];
      return device ? cloneDevice(device) : undefined;
    },
    findZoneById(zoneId) {
      const zone = state.zonesById[zoneId];
      return zone ? cloneZone(zone) : undefined;
    },
    saveDevice(device) {
      state.devicesById[device.id] = cloneDevice(device);
    },
  };
}
