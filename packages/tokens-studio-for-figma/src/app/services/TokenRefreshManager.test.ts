import { TokenRefreshManager, RefreshError } from './TokenRefreshManager';
import { OAuthService } from './OAuthService';
import type { OAuthTokens } from '@/types/oauth';

jest.mock('./OAuthService');

const mockedOAuthService = OAuthService as jest.Mocked<typeof OAuthService>;

const STUDIO_URL = 'production.tokens.studio';

function makeTokens(overrides: Partial<OAuthTokens> = {}): OAuthTokens {
  return {
    accessToken: 'test-access',
    refreshToken: 'test-refresh',
    tokenType: 'Bearer',
    expiresAt: Date.now() + 86400000,
    ...overrides,
  };
}

function makeNewTokens(): OAuthTokens {
  return {
    accessToken: 'new-access',
    refreshToken: 'new-refresh',
    tokenType: 'Bearer',
    expiresAt: Date.now() + 86400000,
  };
}

describe('TokenRefreshManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    TokenRefreshManager.reset();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns new tokens when OAuth refresh succeeds', async () => {
    const newTokens = makeNewTokens();
    mockedOAuthService.refreshOAuthTokens.mockResolvedValue(newTokens);

    const result = await TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL);

    expect(result).toBe(newTokens);
    expect(mockedOAuthService.refreshOAuthTokens).toHaveBeenCalledWith(null, 'test-refresh', STUDIO_URL);
  });

  it('throws a fatal RefreshError on invalid_grant', async () => {
    mockedOAuthService.refreshOAuthTokens.mockRejectedValue(new Error('invalid_grant: token revoked'));

    await expect(TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL))
      .rejects.toMatchObject({ kind: 'fatal', message: 'invalid_grant: token revoked' });
  });

  it('throws a fatal RefreshError on invalid_token', async () => {
    mockedOAuthService.refreshOAuthTokens.mockRejectedValue(new Error('invalid_token'));

    const err = await TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL).catch((e) => e);
    expect(err).toBeInstanceOf(RefreshError);
    expect(err.kind).toBe('fatal');
  });

  it('throws a transient RefreshError on network errors', async () => {
    mockedOAuthService.refreshOAuthTokens.mockRejectedValue(new Error('Network request failed'));

    const err = await TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL).catch((e) => e);
    expect(err).toBeInstanceOf(RefreshError);
    expect(err.kind).toBe('transient');
  });

  it('throws a transient RefreshError on 5xx errors', async () => {
    mockedOAuthService.refreshOAuthTokens.mockRejectedValue(new Error('HTTP 503 Service Unavailable'));

    const err = await TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL).catch((e) => e);
    expect(err).toBeInstanceOf(RefreshError);
    expect(err.kind).toBe('transient');
  });

  it('single-flights concurrent refresh calls', async () => {
    let resolveRefresh: (value: OAuthTokens) => void;
    const newTokens = makeNewTokens();

    mockedOAuthService.refreshOAuthTokens.mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    const tokens = makeTokens();
    const promise1 = TokenRefreshManager.refreshTokens(tokens, STUDIO_URL);
    const promise2 = TokenRefreshManager.refreshTokens(tokens, STUDIO_URL);
    const promise3 = TokenRefreshManager.refreshTokens(tokens, STUDIO_URL);

    // Only one call should have been made
    expect(mockedOAuthService.refreshOAuthTokens).toHaveBeenCalledTimes(1);

    // Resolve the single refresh
    resolveRefresh!(newTokens);

    const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);
    expect(result1).toBe(newTokens);
    expect(result2).toBe(newTokens);
    expect(result3).toBe(newTokens);
  });

  it('clears in-flight promise after successful refresh', async () => {
    const newTokens1 = makeNewTokens();
    const newTokens2 = { ...makeNewTokens(), accessToken: 'second-access' };

    mockedOAuthService.refreshOAuthTokens
      .mockResolvedValueOnce(newTokens1)
      .mockResolvedValueOnce(newTokens2);

    const result1 = await TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL);
    expect(result1).toBe(newTokens1);

    // Second call should make a new request
    const result2 = await TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL);
    expect(result2).toBe(newTokens2);
    expect(mockedOAuthService.refreshOAuthTokens).toHaveBeenCalledTimes(2);
  });

  it('clears in-flight promise after failed refresh', async () => {
    mockedOAuthService.refreshOAuthTokens.mockRejectedValueOnce(new Error('Network error'));

    await expect(TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL)).rejects.toThrow();

    // Should be able to try again
    const newTokens = makeNewTokens();
    mockedOAuthService.refreshOAuthTokens.mockResolvedValue(newTokens);
    const result = await TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL);
    expect(result).toBe(newTokens);
  });
});
