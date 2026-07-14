export type DeviceState = 'idle' | 'watering' | 'paused';

export type ConnectivityStatus = 'online' | 'offline';

export type Account = {
  id: string;
  name: string;
  email: string;
  city: string;
  deviceIds: string[];
};

export type DeviceZone = {
  id: string;
  name: string;
  isActive: boolean;
};

export type Device = {
  id: string;
  name: string;
  location: string;
  state: DeviceState;
  connectivity: ConnectivityStatus;
  batteryLevel: number;
  zoneIds: string[];
  updatedAt: string;
};

export type UpdateDeviceInput = {
  name: string;
};
