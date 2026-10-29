import { useAuthStore } from '../../useAuthStore';
import { OAuthService } from '../../../services/OAuthService';
import { RefreshError } from '../../../services/RefreshError';
import { StudioApiError } from '@/utils/tokensStudio/StudioApiError';
import { ErrorCategory } from '@/types/ErrorCategory';

export const SIGN_IN_REQUIRED = 'signInRequired';
export const VARIABLES_SOURCE_OF_TRUTH = 'variables_source_of_truth';
const PLAN_REQUIRED_CODES = ['plan_does_not_include_feature'];

export class StudioSignInRequiredError extends Error {
  constructor() {
    super('Not signed in to Tokens Studio');
    this.name = 'StudioSignInRequiredError';
  }
}

async function refreshedAccessToken(): Promise<string> {
  await useAuthStore.getState().refreshTokens();
  const { oauthTokens } = useAuthStore.getState();
  if (!oauthTokens?.accessToken) throw new StudioSignInRequiredError();
  return oauthTokens.accessToken;
}

/** The stored access token, refreshed first when it is (nearly) expired. */
export async function getStudioAccessToken(): Promise<string> {
  const { oauthTokens } = useAuthStore.getState();
  if (!oauthTokens?.accessToken) throw new StudioSignInRequiredError();
  return OAuthService.needsRefresh(oauthTokens) ? refreshedAccessToken() : oauthTokens.accessToken;
}

/**
 * Runs a Tokens Studio REST request with a live access token: refreshes first when
 * the stored token is (nearly) expired, and once more if the API still answers 401.
 * A refused refresh (invalid_grant) logs the user out and surfaces as a RefreshError.
 */
export async function withStudioAuth<T>(request: (accessToken: string) => Promise<T>): Promise<T> {
  const accessToken = await getStudioAccessToken();
  try {
    return await request(accessToken);
  } catch (error) {
    if (!(error instanceof StudioApiError) || error.status !== 401) throw error;
    return request(await refreshedAccessToken());
  }
}

export type StudioSyncErrorDescription = {
  type: ErrorCategory;
  header: string;
  message: string;
  code?: string;
};

/** Turns a failed Tokens Studio sync into what the user should read and do next. */
export function describeStudioSyncError(error: unknown): StudioSyncErrorDescription {
  const header = 'Could not load tokens from Tokens Studio';

  if (
    error instanceof StudioSignInRequiredError
    || (error instanceof RefreshError && error.kind === 'fatal')
    || (error instanceof StudioApiError && error.status === 401)
  ) {
    return {
      type: 'credential',
      header: 'Your Tokens Studio sign-in has ended',
      message: 'Sign in to Tokens Studio again to keep syncing this file.',
      code: SIGN_IN_REQUIRED,
    };
  }
  if (error instanceof RefreshError) {
    return {
      type: 'connectivity',
      header,
      message: 'Could not renew your Tokens Studio sign-in. Check your connection and try again.',
    };
  }
  if (error instanceof StudioApiError && error.code === VARIABLES_SOURCE_OF_TRUTH) {
    return {
      type: 'other',
      header: 'This project syncs Figma variables',
      message: 'This project syncs Figma variables, it cannot be pulled as tokens.',
      code: VARIABLES_SOURCE_OF_TRUTH,
    };
  }
  if (error instanceof StudioApiError && error.code && PLAN_REQUIRED_CODES.includes(error.code)) {
    return {
      type: 'other',
      header,
      message: error.message,
      code: error.code,
    };
  }
  return {
    type: error instanceof StudioApiError && error.status >= 500 ? 'connectivity' : 'other',
    header,
    message: error instanceof Error ? error.message : 'Could not load project data.',
  };
}
