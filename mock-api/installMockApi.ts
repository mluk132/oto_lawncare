import { UpdateDeviceInput } from '../src/models/types';
import { mockApiConfig } from './mockApiConfig';
import { createSeedService } from './services/seedService';
import { createInMemoryStore } from './services/store';
import { createApiService, MockApiError } from './services/apiService';

//#region Configuration
const API_PREFIX = '/api';
type MockRouteHandler = () => Promise<Response>;

let isInstalled = false;
const seedService = createSeedService();
const store = createInMemoryStore(seedService.getSeedData());
const apiService = createApiService({
  config: mockApiConfig,
  seedService,
  store,
});
//#endregion

//#region Response Builders

/**
 * Creates a JSON response for successful mock API operations.
 */
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Creates a JSON response for mock API errors.
 */
function errorResponse(message: string, status: number) {
  return jsonResponse({ message }, status);
}

/**
 * Converts fetch input into a URL instance for consistent routing.
 */
function parseUrl(input: RequestInfo | URL) {
  if (input instanceof URL) {
    return input;
  }

  if (typeof input === 'string') {
    return new URL(input, window.location.origin);
  }

  return new URL(input.url, window.location.origin);
}

/**
 * Resolves the effective HTTP method from the fetch arguments.
 */
function getMethod(input: RequestInfo | URL, init?: RequestInit) {
  if (init?.method) {
    return init.method.toUpperCase();
  }

  if (input instanceof Request) {
    return input.method.toUpperCase();
  }

  return 'GET';
}

/**
 * Reads and parses a JSON request body from fetch input.
 */
async function readJsonBody<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T | null> {
  const body = init?.body;

  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as T;
    } catch {
      return null;
    }
  }

  if (body && !(body instanceof URLSearchParams)) {
    return null;
  }

  if (input instanceof Request) {
    const requestBody = await input.clone().text();

    if (!requestBody) {
      return null;
    }

    try {
      return JSON.parse(requestBody) as T;
    } catch {
      return null;
    }
  }

  return null;
}
//#endregion

//#region Route Handlers

/**
 * Handles the account detail endpoint.
 */
async function handleGetAccount(accountId: string) {
  try {
    return jsonResponse(await apiService.getAccount(accountId));
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * Handles the device list endpoint.
 */
async function handleGetDevices(accountId: string) {
  return jsonResponse(await apiService.listDevices(accountId));
}

/**
 * Handles the device detail endpoint.
 */
async function handleGetDevice(deviceId: string) {
  try {
    return jsonResponse(await apiService.getDevice(deviceId));
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * Handles the zones by device endpoint.
 */
async function handleGetZonesByDeviceId(deviceId: string) {
  try {
    return jsonResponse(await apiService.listZonesByDeviceId(deviceId));
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * Handles the device update endpoint.
 */
async function handleUpdateDevice(
  deviceId: string,
  payload: UpdateDeviceInput | null,
) {
  try {
    return jsonResponse(await apiService.updateDevice(deviceId, payload));
  } catch (error) {
    return toErrorResponse(error);
  }
}
//#endregion

//#region Routing

/**
 * Routes mock API requests to the matching endpoint handler.
 */
async function routeMockRequest(input: RequestInfo | URL, init?: RequestInit) {
  const url = parseUrl(input);
  const method = getMethod(input, init);

  const accountMatch = url.pathname.match(/^\/api\/accounts\/([^/]+)$/);
  const accountDevicesMatch = url.pathname.match(
    /^\/api\/accounts\/([^/]+)\/devices$/,
  );

  if (method === 'GET' && accountDevicesMatch?.[1]) {
    const handler: MockRouteHandler = () =>
      handleGetDevices(accountDevicesMatch[1]);
    return handler();
  }

  if (method === 'GET' && accountMatch?.[1]) {
    const handler: MockRouteHandler = () => handleGetAccount(accountMatch[1]);
    return handler();
  }

  const deviceMatch = url.pathname.match(/^\/api\/devices\/([^/]+)$/);
  if (method === 'GET' && deviceMatch?.[1]) {
    const handler: MockRouteHandler = () => handleGetDevice(deviceMatch[1]);
    return handler();
  }

  const zoneMatch = url.pathname.match(/^\/api\/devices\/([^/]+)\/zones$/);
  if (method === 'GET' && zoneMatch?.[1]) {
    const handler: MockRouteHandler = () =>
      handleGetZonesByDeviceId(zoneMatch[1]);
    return handler();
  }

  const singleZoneMatch = url.pathname.match(/^\/api\/zones\/([^/]+)$/);
  if (method === 'GET' && singleZoneMatch?.[1]) {
    return errorResponse(
      `No mock route matched ${method} ${url.pathname}. Zone lookup is not implemented yet.`,
      501,
    );
  }

  if (method === 'PATCH' && deviceMatch?.[1]) {
    const payload = await readJsonBody<UpdateDeviceInput>(input, init);
    return handleUpdateDevice(deviceMatch[1], payload);
  }

  return errorResponse(`No mock route matched ${method} ${url.pathname}.`, 404);
}

/**
 * Translates thrown mock API errors into JSON responses.
 */
function toErrorResponse(error: unknown) {
  if (error instanceof MockApiError) {
    return errorResponse(error.message, error.status);
  }

  return errorResponse((error as Error).message, 500);
}
//#endregion

//#region Installation

/**
 * Installs the mock API by intercepting same-origin API fetch requests.
 */
export function installMockApi() {
  if (typeof window === 'undefined' || isInstalled) {
    return;
  }

  apiService.reset();

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = parseUrl(input);
    const isSameOrigin = url.origin === window.location.origin;
    const isMockRoute = url.pathname.startsWith(API_PREFIX);

    if (!isSameOrigin || !isMockRoute) {
      return originalFetch(input, init);
    }

    return routeMockRequest(input, init);
  };

  isInstalled = true;
}
//#endregion
