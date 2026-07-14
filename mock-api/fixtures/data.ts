import { Account, Device, DeviceZone } from '../../src/models/types';

// A fixed timestamp keeps the seeded fixtures deterministic across reloads.
const now = '2026-04-17T16:00:00.000Z';

export const zoneData: DeviceZone[] = [
  { id: 'zone-1', name: 'Front Lawn', isActive: false },
  { id: 'zone-2', name: 'Back Lawn', isActive: false },
  { id: 'zone-3', name: 'Garden Beds', isActive: false },
  { id: 'zone-4', name: 'Entry Path', isActive: false },
  { id: 'zone-5', name: 'Foundation Beds', isActive: false },
  { id: 'zone-6', name: 'Driveway Strip', isActive: false },
  { id: 'zone-7', name: 'Vegetable Beds', isActive: false },
  { id: 'zone-8', name: 'Citrus Trees', isActive: true },
  { id: 'zone-9', name: 'Fence Border', isActive: false },
  { id: 'zone-10', name: 'Shade Garden', isActive: false },
  { id: 'zone-11', name: 'Native Grasses', isActive: false },
];

export const deviceData: Device[] = [
  {
    id: 'device-2',
    name: 'Front Yard',
    location: 'Front yard',
    state: 'idle',
    connectivity: 'online',
    batteryLevel: 88,
    zoneIds: zoneData.filter((_, index) => index < 3).map((zone) => zone.id),
    updatedAt: now,
  },
  {
    id: 'device-3',
    name: 'Back Garden',
    location: 'Back garden',
    state: 'watering',
    connectivity: 'online',
    batteryLevel: 54,
    zoneIds: zoneData.filter((_, index) => index >= 3 && index < 6).map((zone) => zone.id),
    updatedAt: now,
  },
  {
    id: 'device-4',
    name: 'Side Yard',
    location: 'Side yard',
    state: 'paused',
    connectivity: 'offline',
    batteryLevel: 18,
    zoneIds: zoneData.filter((_, index) => index >= 6).map((zone) => zone.id),
    updatedAt: now,
  },
];

export const accountData: Account[] = [
  {
    id: 'account-1',
    name: 'Morgan Reese',
    email: 'morgan@example.com',
    city: 'Austin',
    deviceIds: deviceData.map((device) => device.id),
  },
];
