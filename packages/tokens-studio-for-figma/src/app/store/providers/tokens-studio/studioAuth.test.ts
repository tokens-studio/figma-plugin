import { useAuthStore } from '../../useAuthStore';
import { RefreshError } from '../../../services/RefreshError';
import { StudioApiError } from '@/utils/tokensStudio/StudioApiError';
import {
  describeStudioSyncError, SIGN_IN_REQUIRED, StudioSignInRequiredError, VARIABLES_SOURCE_OF_TRUTH, withStudioAuth,
} from './studioAuth';

const makeTokens = (accessToken: string, expiresInMs: number) => ({
  accessToken, refreshToken: `${accessToken}-refresh`, tokenType: 'Bearer', expiresAt: Date.now() + expiresInMs,
});

describe('withStudioAuth', () => {
  const refreshTokens = jest.fn();

  beforeEach(() => {
    refreshTokens.mockReset();
    refreshTokens.mockImplementation(async () => useAuthStore.setState({ oauthTokens: makeTokens('fresh', 86400000) }));
    useAuthStore.setState({ refreshTokens });
  });

  it('uses a live token as is', async () => {
    useAuthStore.setState({ oauthTokens: makeTokens('live', 60 * 60 * 1000) });
    const request = jest.fn(async (token: string) => token);

    await expect(withStudioAuth(request)).resolves.toBe('live');
    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it('refreshes an expired token before the request', async () => {
    useAuthStore.setState({ oauthTokens: makeTokens('stale', -1000) });
    const request = jest.fn(async (token: string) => token);

    await expect(withStudioAuth(request)).resolves.toBe('fresh');
    expect(refreshTokens).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('refreshes and retries once when the API answers 401', async () => {
    useAuthStore.setState({ oauthTokens: makeTokens('revoked', 60 * 60 * 1000) });
    const request = jest.fn(async (token: string) => {
      if (token === 'revoked') throw new StudioApiError('Unauthorized', 401);
      return token;
    });

    await expect(withStudioAuth(request)).resolves.toBe('fresh');
    expect(refreshTokens).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('does not retry other failures', async () => {
    useAuthStore.setState({ oauthTokens: makeTokens('live', 60 * 60 * 1000) });
    const request = jest.fn(async () => {
      throw new StudioApiError('Forbidden', 403, VARIABLES_SOURCE_OF_TRUTH);
    });

    await expect(withStudioAuth(request)).rejects.toMatchObject({ status: 403 });
    expect(request).toHaveBeenCalledTimes(1);
    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it('asks for a sign-in when there are no tokens', async () => {
    useAuthStore.setState({ oauthTokens: null });

    await expect(withStudioAuth(jest.fn())).rejects.toBeInstanceOf(StudioSignInRequiredError);
  });
});

describe('describeStudioSyncError', () => {
  it.each([
    ['a refused refresh', new RefreshError('fatal', 'Token refresh failed: 400 invalid_grant')],
    ['a 401 after the retry', new StudioApiError('Unauthorized', 401)],
    ['missing tokens', new StudioSignInRequiredError()],
  ])('asks to sign in again for %s', (_, error) => {
    expect(describeStudioSyncError(error)).toMatchObject({ type: 'credential', code: SIGN_IN_REQUIRED });
  });

  it('explains a variables project', () => {
    const description = describeStudioSyncError(new StudioApiError('Not available', 403, VARIABLES_SOURCE_OF_TRUTH));

    expect(description.code).toBe(VARIABLES_SOURCE_OF_TRUTH);
    expect(description.message).toBe('This project syncs Figma variables, it cannot be pulled as tokens.');
  });

  it('reports a transient refresh failure as connectivity', () => {
    expect(describeStudioSyncError(new RefreshError('transient', 'network error')).type).toBe('connectivity');
  });
});
