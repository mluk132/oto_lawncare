// src/hooks/__tests__/useDashboard.test.ts
//
// Unit tests for the dashboard hook. The api layer is mocked so we can
// assert on loading/error transitions and refresh behaviour without hitting
// the mock server.

import { act, renderHook, waitFor } from '@testing-library/react';
import { useDashboard } from '../useDashboard';
import { ApiError } from '../../api/client';

jest.mock('../../api/endpoints', () => ({
  api: {
    getAccount: jest.fn(),
    getAccountDevices: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { api } = require('../../api/endpoints') as {
  api: {
    getAccount: jest.Mock;
    getAccountDevices: jest.Mock;
  };
};

const ACCOUNT = { id: 'account-1', name: 'Morgan', email: 'm@x', city: 'Austin', deviceIds: [] };
const DEVICES = [
  {
    id: 'd1',
    name: 'Front',
    location: 'Front',
    state: 'idle',
    connectivity: 'online',
    batteryLevel: 90,
    zoneIds: ['z1'],
    updatedAt: '2026-01-01',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useDashboard', () => {
  it('loads account and devices in parallel on mount', async () => {
    api.getAccount.mockResolvedValue(ACCOUNT);
    api.getAccountDevices.mockResolvedValue(DEVICES);

    const { result } = renderHook(() => useDashboard());

    // Initial state before promises resolve.
    expect(result.current.isLoading).toBe(true);
    expect(result.current.account).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.account).toEqual(ACCOUNT);
    expect(result.current.devices).toEqual(DEVICES);
    expect(result.current.error).toBeNull();
    expect(api.getAccount).toHaveBeenCalledWith('account-1');
    expect(api.getAccountDevices).toHaveBeenCalledWith('account-1');
  });

  it('surfaces ApiError messages to the UI', async () => {
    api.getAccount.mockRejectedValue(new ApiError('Account not found', 404, 'accounts/account-1'));
    api.getAccountDevices.mockResolvedValue([]);

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Account not found');
    expect(result.current.account).toBeNull();
  });

  it('falls back to a generic message for non-ApiError failures', async () => {
    api.getAccount.mockRejectedValue(new Error('boom'));
    api.getAccountDevices.mockResolvedValue([]);

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Failed to populate irrigation dashboard.');
  });

  it('refresh re-fetches and toggles isRefreshing (not isLoading)', async () => {
    api.getAccount.mockResolvedValue(ACCOUNT);
    api.getAccountDevices.mockResolvedValue(DEVICES);

    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(api.getAccount).toHaveBeenCalledTimes(2);
    expect(api.getAccountDevices).toHaveBeenCalledTimes(2);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
