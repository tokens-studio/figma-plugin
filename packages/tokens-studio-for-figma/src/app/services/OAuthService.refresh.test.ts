import { OAuthService, REFRESH_TIMEOUT_MS } from './OAuthService';
import { TokenRefreshManager } from './TokenRefreshManager';
import { RefreshError } from './RefreshError';

const STUDIO_URL = 'https://app.tokens.studio';

describe('OAuthService.refreshTokens', () => {
  const mockFetch = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
    TokenRefreshManager.reset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('keeps the OAuth error code of a refused refresh, so it is classified fatal', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'invalid_grant', error_description: 'The provided authorization grant is invalid' }),
    });

    const err = await TokenRefreshManager.refreshTokens({
      accessToken: 'old', refreshToken: 'dead', tokenType: 'Bearer', expiresAt: 0,
    }, STUDIO_URL).catch((e) => e);

    expect(err).toBeInstanceOf(RefreshError);
    expect(err.kind).toBe('fatal');
    expect(err.message).toContain('400 invalid_grant');
  });

  it('treats a network failure as transient', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const err = await TokenRefreshManager.refreshTokens({
      accessToken: 'old', refreshToken: 'live', tokenType: 'Bearer', expiresAt: 0,
    }, STUDIO_URL).catch((e) => e);

    expect(err).toBeInstanceOf(RefreshError);
    expect(err.kind).toBe('transient');
  });

  it('gives up a hung refresh after the timeout as a transient error, keeping the sign-in', async () => {
    jest.useFakeTimers();
    try {
      mockFetch.mockImplementationOnce((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new DOMException('The operation was aborted.', 'AbortError')));
      }));

      const pending = TokenRefreshManager.refreshTokens({
        accessToken: 'old', refreshToken: 'live', tokenType: 'Bearer', expiresAt: 0,
      }, STUDIO_URL).catch((e) => e);
      jest.advanceTimersByTime(REFRESH_TIMEOUT_MS);
      const err = await pending;

      expect(err).toBeInstanceOf(RefreshError);
      expect(err.kind).toBe('transient');
    } finally {
      jest.useRealTimers();
    }
  });

  it('returns the rotated tokens', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'new', refresh_token: 'rotated', token_type: 'Bearer', expires_in: 86400,
      }),
    });

    const tokens = await OAuthService.refreshTokens(null, 'live', STUDIO_URL);

    expect(tokens).toMatchObject({ accessToken: 'new', refreshToken: 'rotated' });
  });
});
