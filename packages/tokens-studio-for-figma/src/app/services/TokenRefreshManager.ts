import { OAuthService } from './OAuthService';
import { RefreshError, classifyError } from './RefreshError';
import type { OAuthTokens } from '@/types/oauth';

/**
 * Single-flight token refresh manager.
 *
 * With rotating refresh tokens the backend revokes the old token on each refresh.
 * If two callers refresh concurrently with the same token the second call would
 * fail (the token was already revoked by the first). This manager ensures only
 * one refresh runs at a time — concurrent callers await the same promise.
 *
 * Uses OAuth refresh (`POST /oauth/token` with grant_type=refresh_token) since
 * the Figma plugin authenticates via Doorkeeper Device Code Flow.
 */
export class TokenRefreshManager {
  private static inflightRefresh: Promise<OAuthTokens> | null = null;

  /**
   * Refresh the given tokens. If a refresh is already in-flight all callers
   * receive the same result (single-flight).
   */
  static async refreshTokens(
    currentTokens: OAuthTokens,
    studioUrl: string,
  ): Promise<OAuthTokens> {
    if (this.inflightRefresh) {
      return this.inflightRefresh;
    }

    this.inflightRefresh = this.doRefresh(currentTokens, studioUrl).finally(() => {
      this.inflightRefresh = null;
    });

    return this.inflightRefresh;
  }

  private static async doRefresh(
    currentTokens: OAuthTokens,
    studioUrl: string,
  ): Promise<OAuthTokens> {
    try {
      return await OAuthService.refreshTokens(null, currentTokens.refreshToken, studioUrl);
    } catch (error) {
      const kind = classifyError(error);
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      throw new RefreshError(kind, message);
    }
  }

  /** Visible for testing — reset the in-flight promise. */
  static reset(): void {
    this.inflightRefresh = null;
  }
}
