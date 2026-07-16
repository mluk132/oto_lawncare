// src/api/client.ts
//
// Thin fetch wrapper for the mock `/api` surface. Centralises:
//   - base URL and JSON headers
//   - request timeouts via AbortController
//   - error normalisation into a typed ApiError

/** The mock API is served under a relative `/api` prefix. */
const API_BASE_URL = '/api';

/** Requests that exceed this timeout are aborted and reported as 408. */
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Typed error thrown by the API layer. Carries enough context for the UI
 * layer to differentiate network failures from HTTP errors and to display
 * a meaningful message to the user.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status code, or 0 for network failures, 408 for timeouts. */
    public status: number,
    /** The endpoint path that failed — useful for logging. */
    public endpoint: string,
    /** True when the request never reached the server (offline / DNS). */
    public isNetworkError: boolean = false,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Internal request helper. Wraps `fetch` with timeout handling, JSON
 * serialisation, and structured error mapping. All API failures resolve
 * (well, reject) as `ApiError` instances so callers only need one catch.
 */
async function makeRequest(endpoint: string, method: string, body?: any): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const config: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
    clearTimeout(timeoutId);

    let data: any = {};
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch {
      // Catch empty or malformed non-JSON responses gracefully
    }

    if (!response.ok) {
      const msg = data.message || response.statusText || `HTTP Error ${response.status}`;
      throw new ApiError(msg, response.status, endpoint);
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out', 408, endpoint);
    }

    // Capture standard React Native/Web network loss states
    if (error.message === 'Network request failed' || error.name === 'TypeError') {
      throw new ApiError('No internet connection', 0, endpoint, true);
    }

    throw error;
  }
}

/**
 * Public HTTP verbs used by the app. Only `GET` and `PATCH` are needed
 * for the current spec — extend when new endpoints are added.
 */
export const client = {
  get: (endpoint: string) => makeRequest(endpoint, 'GET'),
  patch: (endpoint: string, body: any) => makeRequest(endpoint, 'PATCH', body),
};