import { accountData, deviceData, zoneData } from '../fixtures/data';
import { SeedData } from './types';

export interface SeedService {
  getSeedData(): SeedData;
}

export function createSeedService(): SeedService {
  return {
    getSeedData() {
      return {
        accounts: accountData,
        devices: deviceData,
        zones: zoneData,
      };
    },
  };
}
