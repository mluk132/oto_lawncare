// src/hooks/__tests__/useDeviceDetail.test.ts
//
// Unit tests for the device-detail hook. Focuses on the rename mutation:
// optimistic update, rollback on failure, and returning the correct boolean
// for the caller to close/keep the edit form.

import { act, renderHook, waitFor } from '@testing-library/react';
import { useDeviceDetail } from '../useDeviceDetail';
import { ApiError } from '../../api/client';

jest.mock('../../api/endpoints', () => ({
  api: {
    getDeviceById: jest.fn(),
    getDeviceZones: jest.fn(),
    updateDevice: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { api } = require('../../api/endpoints') as {
  api: {
    getDeviceById: jest.Mock;
    getDeviceZones: jest.Mock;
    updateDevice: jest.Mock;
  };
};

const DEVICE = {
  id: 'd1',
  name: 'Front Yard',
  location: 'Front',
  state: 'idle' as const,
  connectivity: 'online' as const,
  batteryLevel: 88,
  zoneIds: ['z1'],
  updatedAt: '2026-01-01',
};

const ZONES = [{ id: 'z1', name: 'Front Lawn', isActive: false }];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useDeviceDetail', () => {
  it('fetches device and zones in parallel', async () => {
    api.getDeviceById.mockResolvedValue(DEVICE);
    api.getDeviceZones.mockResolvedValue(ZONES);

    const { result } = renderHook(() => useDeviceDetail('d1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.device).toEqual(DEVICE);
    expect(result.current.zones).toEqual(ZONES);
    expect(result.current.error).toBeNull();
  });

  it('surfaces fetch errors', async () => {
    api.getDeviceById.mockRejectedValue(new ApiError('Not found', 404, 'devices/d1'));
    api.getDeviceZones.mockResolvedValue([]);

    const { result } = renderHook(() => useDeviceDetail('d1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Not found');
  });

  describe('renameDevice', () => {
    beforeEach(() => {
      api.getDeviceById.mockResolvedValue(DEVICE);
      api.getDeviceZones.mockResolvedValue(ZONES);
    });

    it('optimistically updates and confirms on success', async () => {
      const renamed = { ...DEVICE, name: 'Backyard' };
      api.updateDevice.mockResolvedValue(renamed);

      const { result } = renderHook(() => useDeviceDetail('d1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.renameDevice('Backyard');
      });

      expect(success).toBe(true);
      expect(result.current.device?.name).toBe('Backyard');
      expect(result.current.updateError).toBeNull();
      expect(result.current.isUpdating).toBe(false);
      expect(api.updateDevice).toHaveBeenCalledWith('d1', { name: 'Backyard' });
    });

    it('rolls back and reports error on failure', async () => {
      api.updateDevice.mockRejectedValue(new ApiError('Update failed', 500, 'devices/d1'));

      const { result } = renderHook(() => useDeviceDetail('d1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.renameDevice('Backyard');
      });

      expect(success).toBe(false);
      expect(result.current.device?.name).toBe('Front Yard'); // rolled back
      expect(result.current.updateError).toBe('Update failed');
      expect(result.current.isUpdating).toBe(false);
    });

    it('ignores empty names without calling the API', async () => {
      const { result } = renderHook(() => useDeviceDetail('d1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.renameDevice('   ');
      });

      expect(success).toBe(false);
      expect(api.updateDevice).not.toHaveBeenCalled();
    });
  });
});
