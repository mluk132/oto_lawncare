import { Account, Device, DeviceZone, UpdateDeviceInput } from '../../src/models/types';
import { MockApiConfig } from '../mockApiConfig';
import { SeedService } from './seedService';
import { Store } from './store';

export class MockApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export interface ApiService {
  reset(): void;
  getAccount(accountId: string): Promise<Account>;
  listDevices(accountId: string): Promise<Device[]>;
  listZonesByDeviceId(deviceId: string): Promise<DeviceZone[]>;
  getDevice(deviceId: string): Promise<Device>;
  updateDevice(
    deviceId: string,
    payload: UpdateDeviceInput | null,
  ): Promise<Device>;
}

type CreateApiServiceInput = {
  config: MockApiConfig;
  seedService: SeedService;
  store: Store;
};

export function createApiService({
  config,
  seedService,
  store,
}: CreateApiServiceInput): ApiService {
  return {
    reset() {
      store.reset(seedService.getSeedData());
    },
    async getAccount(accountId) {
      await withLatency(config);

      const account = store.findAccountById(accountId);
      if (!account) {
        throw new MockApiError(`Account ${accountId} was not found.`, 404);
      }

      return account;
    },
    async listDevices(accountId) {
      await withLatency(config);
      return store.listDevices(accountId);
    },
    async listZonesByDeviceId(deviceId) {
      await withLatency(config);
      return store.listZonesByDeviceId(deviceId);
    },
    async getDevice(deviceId) {
      await withLatency(config);

      const device = store.findDeviceById(deviceId);
      if (!device) {
        throw new MockApiError(`Device ${deviceId} was not found.`, 404);
      }

      return device;
    },
    async updateDevice(deviceId, payload) {
      await withLatency(config);

      if (!payload) {
        throw new MockApiError('Request body is required.', 400);
      }

      const { name } = payload;

      if (!name?.trim()) {
        throw new MockApiError('name is required.', 400);
      }

      if (config.forceUpdateDeviceError) {
        throw new MockApiError('The device update failed. Please try again.', 500);
      }

      const device = store.findDeviceById(deviceId);
      if (!device) {
        throw new MockApiError(`Device ${deviceId} was not found.`, 404);
      }

      const updatedDevice: Device = {
        ...device,
        name: name.trim(),
        updatedAt: new Date().toISOString(),
      };

      store.saveDevice(updatedDevice);
      return updatedDevice;
    },
  };
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function withLatency(config: MockApiConfig) {
  await delay(config.artificialDelayMs + config.extraArtificialDelayMs);
}
