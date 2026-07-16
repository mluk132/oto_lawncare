// src/api/__tests__/client.test.ts
//
// Tests for the API client. Covers:
//   - ApiError shape (used by hooks to branch on status / network state)
//   - client.get: URL construction, JSON parsing, HTTP error mapping
//   - client.patch: body serialisation, server-message extraction
//   - Network failure translation to isNetworkError

import { ApiError, client } from '../client';

const originalFetch = global.fetch;

type MockResponseInit = {
  status?: number;
  statusText?: string;
  body?: unknown;
};

function mockFetchOnce({ status = 200, statusText = 'OK', body }: MockResponseInit) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

afterEach(() => {
  global.fetch = originalFetch;
  jest.clearAllMocks();
});

describe('ApiError', () => {
  it('captures message, status, endpoint, and defaults isNetworkError to false', () => {
    const err = new ApiError('Not found', 404, 'accounts/1');

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiError');
    expect(err.message).toBe('Not found');
    expect(err.status).toBe(404);
    expect(err.endpoint).toBe('accounts/1');
    expect(err.isNetworkError).toBe(false);
  });

  it('supports the isNetworkError flag for offline detection', () => {
    const err = new ApiError('No internet connection', 0, 'accounts/1', true);
    expect(err.isNetworkError).toBe(true);
    expect(err.status).toBe(0);
  });
});

describe('client.get', () => {
  it('calls fetch with the /api prefix and JSON headers, and parses the body', async () => {
    const fetchMock = mockFetchOnce({ status: 200, body: { id: 'account-1', name: 'Morgan' } });

    const data = await client.get('accounts/account-1');

    expect(data).toEqual({ id: 'account-1', name: 'Morgan' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/accounts/account-1');
    expect(init.method).toBe('GET');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(init.body).toBeUndefined();
  });

  it('throws ApiError with server-provided message on non-2xx responses', async () => {
    mockFetchOnce({ status: 404, statusText: 'Not Found', body: { message: 'Account missing' } });

    await expect(client.get('accounts/nope')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      endpoint: 'accounts/nope',
      message: 'Account missing',
    });
  });

  it('falls back to statusText when the error response has no message', async () => {
    mockFetchOnce({ status: 500, statusText: 'Internal Server Error', body: {} });

    await expect(client.get('boom')).rejects.toMatchObject({
      status: 500,
      message: 'Internal Server Error',
    });
  });

  it('translates network failures into isNetworkError=true', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch')) as unknown as typeof fetch;

    await expect(client.get('accounts/1')).rejects.toMatchObject({
      status: 0,
      isNetworkError: true,
      message: 'No internet connection',
    });
  });
});

describe('client.patch', () => {
  it('serialises the body as JSON and sends the correct method', async () => {
    const fetchMock = mockFetchOnce({
      status: 200,
      body: { id: 'd1', name: 'Front Garden' },
    });

    const data = await client.patch('devices/d1', { name: 'Front Garden' });

    expect(data).toEqual({ id: 'd1', name: 'Front Garden' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/devices/d1');
    expect(init.method).toBe('PATCH');
    expect(init.body).toBe(JSON.stringify({ name: 'Front Garden' }));
  });

  it('surfaces server validation errors as ApiError', async () => {
    mockFetchOnce({ status: 400, body: { message: 'name is required.' } });

    await expect(client.patch('devices/d1', { name: '' })).rejects.toMatchObject({
      status: 400,
      message: 'name is required.',
    });
  });
});
