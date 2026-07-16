// src/hooks/useDashboard.ts
//
// Owns the async lifecycle for the dashboard screen: initial fetch,
// pull-to-refresh, loading state, and error handling. Consumers stay
// presentational — they read the returned state and call `refresh`.

import { useState, useEffect } from 'react';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import type { Account, Device } from '../models/types';

/** Spec says: authentication is out of scope, hard-code `account-1`. */
const TARGET_ACCOUNT_ID = 'account-1';

/**
 * Fetches the current account and its devices in parallel.
 *
 * @returns `account`, `devices`, `isLoading` (first load), `isRefreshing`
 * (pull-to-refresh), `error` (user-facing message), and `refresh()` to
 * re-trigger the fetch.
 */
export function useDashboard() {
  const [account, setAccount] = useState<Account | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Parallel fetch — account and devices are independent requests.
      const [accountData, devicesData] = await Promise.all([
        api.getAccount(TARGET_ACCOUNT_ID),
        api.getAccountDevices(TARGET_ACCOUNT_ID),
      ]);
      setAccount(accountData);
      setDevices(devicesData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to populate irrigation dashboard.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    account,
    devices,
    isLoading,
    isRefreshing,
    error,
    refresh: () => loadDashboardData(true)
  };
}
