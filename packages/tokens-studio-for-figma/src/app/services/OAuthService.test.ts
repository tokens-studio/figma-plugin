import { OAuthService } from './OAuthService';
import { OAuthErrorType } from '@/types/OAuthError';

const originalFetch = global.fetch;
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Helper: create a valid JWT with a given exp claim
function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa('fake-signature');
  return `${header}.${body}.${signature}`;
}

describe('OAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('refreshJwtTokens', () => {
    const STUDIO_URL = 'production.tokens.studio';

    it('calls POST /api/v1/auth/refresh with refresh_token body', async () => {
      const exp = Math.floor(Date.now() / 1000) + 86400;
      const jwt = makeJwt({ sub: 'user-1', exp });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { type: 'users', id: 'user-1', attributes: {} },
          meta: { token: jwt, refresh_token: 'new-refresh' },
        }),
      });

      const result = await OAuthService.refreshJwtTokens('old-refresh', STUDIO_URL);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-production.tokens.studio/api/v1/auth/refresh',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: 'old-refresh' }),
        }),
      );
      expect(result.accessToken).toBe(jwt);
      expect(result.refreshToken).toBe('new-refresh');
      expect(result.tokenType).toBe('Bearer');
    });

    it('derives expiresAt from JWT exp claim', async () => {
      const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const jwt = makeJwt({ sub: 'user-1', exp });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {},
          meta: { token: jwt, refresh_token: 'new-refresh' },
        }),
      });

      const result = await OAuthService.refreshJwtTokens('old-refresh', STUDIO_URL);
      expect(result.expiresAt).toBe(exp * 1000);
    });

    it('falls back to 24h expiry for non-JWT tokens', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {},
          meta: { token: 'not-a-jwt', refresh_token: 'new-refresh' },
        }),
      });

      const result = await OAuthService.refreshJwtTokens('old-refresh', STUDIO_URL);
      expect(result.expiresAt).toBe(now + 24 * 60 * 60 * 1000);

      jest.restoreAllMocks();
    });

    it('throws OAuthError on 401 with error details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          errors: [{ code: 'invalid_token', detail: 'Invalid or expired refresh token' }],
        }),
      });

      await expect(OAuthService.refreshJwtTokens('bad-token', STUDIO_URL)).rejects.toMatchObject({
        type: OAuthErrorType.TOKEN_REFRESH_FAILED,
        message: 'invalid_token: Invalid or expired refresh token',
      });
    });

    it('throws OAuthError on 401 for inactive account', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          errors: [{ code: 'account_inactive', detail: 'Account is inactive' }],
        }),
      });

      await expect(OAuthService.refreshJwtTokens('some-token', STUDIO_URL)).rejects.toMatchObject({
        type: OAuthErrorType.TOKEN_REFRESH_FAILED,
        message: 'account_inactive: Account is inactive',
      });
    });

    it('throws OAuthError when response is missing meta.token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {},
          meta: { refresh_token: 'new-refresh' },
        }),
      });

      await expect(OAuthService.refreshJwtTokens('old-refresh', STUDIO_URL)).rejects.toMatchObject({
        type: OAuthErrorType.TOKEN_REFRESH_FAILED,
      });
    });

    it('throws OAuthError on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(OAuthService.refreshJwtTokens('old-refresh', STUDIO_URL)).rejects.toThrow();
    });
  });

  describe('getExpiresAtFromJwt', () => {
    it('extracts exp from a valid JWT', () => {
      const exp = 1700000000;
      const jwt = makeJwt({ sub: 'user-1', exp });
      expect(OAuthService.getExpiresAtFromJwt(jwt)).toBe(exp * 1000);
    });

    it('returns default expiry for non-JWT strings', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      expect(OAuthService.getExpiresAtFromJwt('not-a-jwt')).toBe(now + 24 * 60 * 60 * 1000);

      jest.restoreAllMocks();
    });

    it('returns default expiry for JWT without exp claim', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      const jwt = makeJwt({ sub: 'user-1' }); // no exp
      expect(OAuthService.getExpiresAtFromJwt(jwt)).toBe(now + 24 * 60 * 60 * 1000);

      jest.restoreAllMocks();
    });
  });

  describe('refreshOAuthTokens', () => {
    it('calls POST /oauth/token with grant_type=refresh_token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          token_type: 'Bearer',
          expires_in: 86400,
        }),
      });

      const result = await OAuthService.refreshOAuthTokens(null, 'old-refresh', 'production.tokens.studio');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-production.tokens.studio/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      expect(result.accessToken).toBe('new-access');
      expect(result.refreshToken).toBe('new-refresh');
    });
  });
});
