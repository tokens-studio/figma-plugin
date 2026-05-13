import { OAuthService } from './OAuthService';
import type { OAuthTokens } from '@/types/oauth';

/**
 * Single-flight token refresh manager.
 *
 * With rotating refresh tokens the backend revokes the old token on each refresh.
 * If two callers refresh concurrently with the same token the second call would
 * fail (the token was already revoked by the first). This manager ensures only
 * one refresh runs at a time — concurrent callers await the same promise.
 *
 * Strategy: try JWT refresh first (`POST /api/v1/auth/refresh`), fall back to
 * OAuth refresh (`POST /oauth/token`) on any failure. This handles both token
 * families transparently.
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
    // 1. Try JWT refresh first
    try {
      return await OAuthService.refreshJwtTokens(currentTokens.refreshToken, studioUrl);
    } catch (jwtError) {
      console.warn('[TokenRefreshManager] JWT refresh failed, falling back to OAuth refresh', jwtError);
    }

    // 2. Fall back to OAuth refresh
    try {
      return await OAuthService.refreshOAuthTokens(null, currentTokens.refreshToken, studioUrl);
    } catch (oauthError) {
      console.error('[TokenRefreshManager] OAuth refresh also failed', oauthError);
      throw oauthError;
    }
  }

  /** Visible for testing — reset the in-flight promise. */
  static reset(): void {
    this.inflightRefresh = null;
  }
}
