import * as Sentry from '@sentry/react';
import { LICENSE_API_TIMEOUT_MS, fetchLicenseApi } from './licenseApi';
import { LICENSE_API_HOSTS } from './licenseApiUrl';
import { track } from './analytics';

jest.mock('./analytics', () => ({ track: jest.fn() }));
jest.mock('@sentry/react', () => ({ addBreadcrumb: jest.fn(), captureMessage: jest.fn() }));

const [PRIMARY, LEGACY] = LICENSE_API_HOSTS;

const json = (status: number, body: unknown) => ({ status, text: async () => JSON.stringify(body) });
const raw = (status: number, text: string) => ({ status, text: async () => text });

// Never settles on its own — only when the timeout aborts it.
const hangs = () => (_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
  init.signal?.addEventListener('abort', () => {
    const error = new Error('Aborted');
    error.name = 'AbortError';
    reject(error);
  });
});

const mockFetch = (...responses: any[]) => {
  const fetchMock = jest.fn();
  responses.forEach((response) => {
    fetchMock.mockImplementationOnce(
      typeof response === 'function' ? response : () => Promise.resolve(response),
    );
  });
  global.fetch = fetchMock as any;
  return fetchMock;
};

const lastTrackCall = () => (track as jest.Mock).mock.calls[(track as jest.Mock).mock.calls.length - 1];

describe('fetchLicenseApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves on the primary host without touching the legacy one', async () => {
    const fetchMock = mockFetch(json(200, { key: 'abc' }));

    const result = await fetchLicenseApi<{ key: string }>('/get-license?userId=1', { endpoint: 'get-license' });

    expect(result).toMatchObject({ ok: true, data: { key: 'abc' } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(`${PRIMARY}/get-license?userId=1`);
    expect(track).not.toHaveBeenCalled();
  });

  it.each([
    ['a 500', json(500, { message: 'boom' })],
    ['a 404', json(404, { message: 'No license key found' })],
    ['a 403', json(403, { message: 'Forbidden' })],
    ['an unparseable 200', raw(200, '<html>gateway</html>')],
    ['an empty 200', raw(200, '')],
  ])('falls back to the legacy host on %s from the primary', async (_label, primaryResponse) => {
    const fetchMock = mockFetch(primaryResponse, json(200, { key: 'abc' }));

    const result = await fetchLicenseApi<{ key: string }>('/get-license?userId=1', { endpoint: 'get-license' });

    expect(result).toMatchObject({ ok: true, data: { key: 'abc' } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toEqual(`${LEGACY}/get-license?userId=1`);
  });

  it('falls back when the primary cannot be reached at all', async () => {
    const fetchMock = mockFetch(() => Promise.reject(new Error('Network request failed')), json(200, { key: 'abc' }));

    const result = await fetchLicenseApi<{ key: string }>('/get-license?userId=1', { endpoint: 'get-license' });

    expect(result).toMatchObject({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(lastTrackCall()[1]).toMatchObject({ primaryReason: 'transport', primaryStatus: null });
  });

  it('gives up on a hanging primary and falls back', async () => {
    jest.useFakeTimers();
    const fetchMock = mockFetch(hangs(), json(200, { key: 'abc' }));

    const pending = fetchLicenseApi<{ key: string }>('/get-license?userId=1', { endpoint: 'get-license' });
    await Promise.resolve();
    jest.advanceTimersByTime(LICENSE_API_TIMEOUT_MS);

    const result = await pending;

    expect(result).toMatchObject({ ok: true, data: { key: 'abc' } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(lastTrackCall()[1]).toMatchObject({ primaryReason: 'timeout' });
    jest.useRealTimers();
  });

  it('falls back when the primary answers 200 with an incomplete payload', async () => {
    const fetchMock = mockFetch(
      json(200, { plan: null, entitlements: [] }),
      json(200, { plan: 'pro', entitlements: ['pro'] }),
    );

    const result = await fetchLicenseApi<{ plan?: string; entitlements?: string[] }>('/validate-license', {
      endpoint: 'validate-license',
      isComplete: (data) => Boolean(data?.plan) || (data?.entitlements?.length ?? 0) > 0,
    });

    expect(result).toMatchObject({ ok: true, data: { plan: 'pro' } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(lastTrackCall()[1]).toMatchObject({ primaryReason: 'incomplete', primaryStatus: 200 });
  });

  it('surfaces the legacy host error message when both hosts fail', async () => {
    mockFetch(json(404, { message: 'not found on new' }), json(404, { message: 'No license key found' }));

    const result = await fetchLicenseApi('/get-license?userId=1', { endpoint: 'get-license' });

    expect(result).toMatchObject({ ok: false, message: 'No license key found' });
  });

  it('returns a null message when neither host produced one', async () => {
    mockFetch(() => Promise.reject(new Error('nope')), () => Promise.reject(new Error('nope')));

    const result = await fetchLicenseApi('/get-license?userId=1', { endpoint: 'get-license' });

    expect(result).toMatchObject({ ok: false, message: null });
  });

  it('passes request options through to every host', async () => {
    const fetchMock = mockFetch(json(500, { message: 'boom' }), json(200, 'detached'));

    await fetchLicenseApi<string>('/detach-license', {
      endpoint: 'detach-license',
      init: { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{"licenseKey":"a"}' },
    });

    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'PUT', body: '{"licenseKey":"a"}' });
  });

  describe('telemetry', () => {
    it('flags a migration gap when only the legacy host can answer', async () => {
      mockFetch(json(404, { message: 'not found' }), json(200, { key: 'abc' }));

      await fetchLicenseApi('/get-license?userId=1', { endpoint: 'get-license', figmaId: 'figma-user-1' });

      expect(track).toHaveBeenCalledWith('License API fallback', expect.objectContaining({
        endpoint: 'get-license',
        primaryStatus: 404,
        primaryReason: 'status',
        fallbackStatus: 200,
        resolvedBy: LEGACY,
        migrationGap: true,
        figmaId: 'figma-user-1',
      }));
    });

    // Users with no license 404 on both hosts forever. Counting them as gaps
    // would leave the cutover metric with a floor it can never clear.
    it('does not flag a migration gap when neither host has the record', async () => {
      mockFetch(json(404, { message: 'not found' }), json(404, { message: 'No license key found' }));

      await fetchLicenseApi('/get-license?userId=1', { endpoint: 'get-license' });

      expect(lastTrackCall()[1]).toMatchObject({ migrationGap: false, resolvedBy: null });
    });

    it('reports to Sentry only when every host is unreachable', async () => {
      mockFetch(json(404, { message: 'a' }), json(404, { message: 'b' }));
      await fetchLicenseApi('/get-license?userId=1', { endpoint: 'get-license' });
      expect(Sentry.captureMessage).not.toHaveBeenCalled();

      mockFetch(() => Promise.reject(new Error('down')), () => Promise.reject(new Error('down')));
      await fetchLicenseApi('/get-license?userId=1', { endpoint: 'get-license' });
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'License API unreachable: get-license',
        expect.objectContaining({ level: 'error' }),
      );
    });
  });
});
