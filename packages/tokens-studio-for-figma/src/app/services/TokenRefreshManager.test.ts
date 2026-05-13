import { TokenRefreshManager } from './TokenRefreshManager';
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

  it('returns new tokens when JWT refresh succeeds', async () => {
    const newTokens = makeNewTokens();
    mockedOAuthService.refreshJwtTokens.mockResolvedValue(newTokens);

    const result = await TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL);

    expect(result).toBe(newTokens);
    expect(mockedOAuthService.refreshJwtTokens).toHaveBeenCalledWith('test-refresh', STUDIO_URL);
    expect(mockedOAuthService.refreshOAuthTokens).not.toHaveBeenCalled();
  });

  it('falls back to OAuth refresh when JWT refresh fails', async () => {
    const newTokens = makeNewTokens();
    mockedOAuthService.refreshJwtTokens.mockRejectedValue(new Error('invalid_token'));
    mockedOAuthService.refreshOAuthTokens.mockResolvedValue(newTokens);

    const result = await TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL);

    expect(result).toBe(newTokens);
    expect(mockedOAuthService.refreshJwtTokens).toHaveBeenCalledTimes(1);
    expect(mockedOAuthService.refreshOAuthTokens).toHaveBeenCalledWith(null, 'test-refresh', STUDIO_URL);
  });

  it('throws when both JWT and OAuth refresh fail', async () => {
    mockedOAuthService.refreshJwtTokens.mockRejectedValue(new Error('JWT failed'));
    mockedOAuthService.refreshOAuthTokens.mockRejectedValue(new Error('OAuth failed'));

    await expect(TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL))
      .rejects.toThrow('OAuth failed');
  });

  it('single-flights concurrent refresh calls', async () => {
    let resolveRefresh: (value: OAuthTokens) => void;
    const newTokens = makeNewTokens();

    mockedOAuthService.refreshJwtTokens.mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    const tokens = makeTokens();
    const promise1 = TokenRefreshManager.refreshTokens(tokens, STUDIO_URL);
    const promise2 = TokenRefreshManager.refreshTokens(tokens, STUDIO_URL);
    const promise3 = TokenRefreshManager.refreshTokens(tokens, STUDIO_URL);

    // Only one call should have been made
    expect(mockedOAuthService.refreshJwtTokens).toHaveBeenCalledTimes(1);

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

    mockedOAuthService.refreshJwtTokens
      .mockResolvedValueOnce(newTokens1)
      .mockResolvedValueOnce(newTokens2);

    const result1 = await TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL);
    expect(result1).toBe(newTokens1);

    // Second call should make a new request
    const result2 = await TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL);
    expect(result2).toBe(newTokens2);
    expect(mockedOAuthService.refreshJwtTokens).toHaveBeenCalledTimes(2);
  });

  it('clears in-flight promise after failed refresh', async () => {
    mockedOAuthService.refreshJwtTokens.mockRejectedValue(new Error('fail'));
    mockedOAuthService.refreshOAuthTokens.mockRejectedValue(new Error('also fail'));

    await expect(TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL)).rejects.toThrow();

    // Should be able to try again
    const newTokens = makeNewTokens();
    mockedOAuthService.refreshJwtTokens.mockResolvedValue(newTokens);
    const result = await TokenRefreshManager.refreshTokens(makeTokens(), STUDIO_URL);
    expect(result).toBe(newTokens);
  });
});
