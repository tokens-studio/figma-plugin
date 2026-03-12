import { sha256 } from 'js-sha256';
import type {
  OAuthConfig,
  DeviceAuthorizationResponse,
  TokenResponse,
  OAuthTokens,
  KeypairResponse,
} from '@/types/oauth';
import { OAuthError, OAuthErrorType } from '@/types/OAuthError';

export class OAuthService {
  private static readonly DEFAULT_STUDIO_URL = 'app.tokens.studio';

  private static readonly DEFAULT_CLIENT_ID = 'figma_plugin';

  private static readonly DEFAULT_SCOPE = 'read write';

  private static readonly PKCE_SCOPES = [
    'organizations:read',
    'projects:read',
    'full_access',
  ];

  private static readonly POLLING_INTERVAL = 5000; // 5 seconds for PKCE polling

  // ============================================
  // Utility methods
  // ============================================

  static getApiBaseUrl(studioUrl: string): string {
    // For local dev mapping
    if (studioUrl.includes('localhost') || studioUrl.includes('127.0.0.1')) {
      if (studioUrl === 'localhost:3001') return 'http://localhost:3000';
      return `http://${studioUrl}`;
    }
    // Check if it's production.tokens.studio
    if (studioUrl.includes('production.tokens.studio') || studioUrl.includes('api-production.tokens.studio')) {
      return 'https://api-production.tokens.studio';
    }
    if (studioUrl.includes('staging.tokens.studio') || studioUrl.includes('api-staging.tokens.studio')) {
      return 'https://api-staging.tokens.studio';
    }

    // Default fallback
    if (studioUrl === 'app.tokens.studio' || studioUrl === 'tokens.studio') {
      return 'https://api.tokens.studio';
    }

    return `https://api.${studioUrl}`;
  }

  /**
     * Check if this studio URL uses the new backend (Device Code Flow)
     * or old backend (PKCE Flow)
     */
  static usesDeviceCodeFlow(studioUrl: string): boolean {
    const apiBaseUrl = this.getApiBaseUrl(studioUrl);
    // New backend usually has api-staging or api-production or localhost
    return apiBaseUrl.includes('api-staging') || apiBaseUrl.includes('api-production') || apiBaseUrl.includes('localhost');
  }

  /**
     * Generate PKCE code verifier and challenge
     */
  private static async generatePKCEPair(): Promise<{
    codeVerifier: string;
    codeChallenge: string;
  }> {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const array = new Uint8Array(96);
    window.crypto.getRandomValues(array);
    const codeVerifier = Array.from(array)
      .map((x) => charset[x % charset.length])
      .join('');

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = sha256.create();
    hash.update(data);
    const hashBuffer = hash.arrayBuffer();
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const codeChallenge = btoa(String.fromCharCode.apply(null, hashArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return { codeVerifier, codeChallenge };
  }

  // ============================================
  // Configuration fetching
  // ============================================

  /**
     * Fetch OAuth configuration from the studio URL
     * For old backend: fetches from https://{studioUrl}/.well-known/plugin-config.json
     * For new backend: fetches from https://{apiBaseUrl}/.well-known/plugin-config.json
     */
  static async fetchOAuthConfig(studioUrl: string): Promise<OAuthConfig> {
    const usesNewBackend = this.usesDeviceCodeFlow(studioUrl);
    const configUrl = usesNewBackend
      ? `${this.getApiBaseUrl(studioUrl)}/.well-known/plugin-config.json`
      : `https://${studioUrl}/.well-known/plugin-config.json`;

    try {
      const response = await fetch(configUrl);

      if (!response.ok) {
        if (response.status === 0 || response.type === 'opaque') {
          throw new OAuthError(
            OAuthErrorType.CONFIG_FETCH_FAILED,
            `CORS error: Server at ${configUrl} is not allowing requests from Figma plugin origin.`,
            'Server configuration issue: CORS not configured for Figma plugin.',
          );
        }

        throw new OAuthError(
          OAuthErrorType.CONFIG_FETCH_FAILED,
          `Failed to fetch OAuth config: ${response.status} ${response.statusText}`,
          `Server returned ${response.status}. Check that ${configUrl} exists.`,
        );
      }

      const config = await response.json();

      // Validate required OAuth fields
      if (!config.oauth || !config.oauth.token_endpoint) {
        throw new OAuthError(
          OAuthErrorType.INVALID_CONFIG,
          'Invalid OAuth configuration: missing required fields',
        );
      }

      return config as OAuthConfig;
    } catch (error) {
      console.error('Error fetching OAuth config:', error);

      if (error instanceof OAuthError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        error instanceof TypeError
        && errorMessage.includes('Failed to fetch')
      ) {
        throw new OAuthError(
          OAuthErrorType.CONFIG_FETCH_FAILED,
          `Network/CORS error: Cannot reach ${configUrl}.`,
          'Cannot connect to server. Check server is running and CORS is configured.',
        );
      }

      throw new OAuthError(
        OAuthErrorType.CONFIG_FETCH_FAILED,
        `Failed to fetch OAuth configuration: ${errorMessage}`,
      );
    }
  }

  // ============================================
  // PKCE Flow (Old backend - app.tokens.studio)
  // ============================================

  static async generateKeypair(config: OAuthConfig): Promise<KeypairResponse> {
    if (!config.oauth.generate_keypair) {
      throw new OAuthError(
        OAuthErrorType.INVALID_CONFIG,
        'OAuth config missing generate_keypair endpoint',
      );
    }

    try {
      const response = await fetch(config.oauth.generate_keypair, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new OAuthError(
          OAuthErrorType.KEYPAIR_GENERATION_FAILED,
          `Failed to generate keypair: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating keypair:', error);

      if (error instanceof OAuthError) {
        throw error;
      }

      throw new OAuthError(
        OAuthErrorType.KEYPAIR_GENERATION_FAILED,
        `Failed to generate authentication keypair: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static buildAuthorizationUrl(
    config: OAuthConfig,
    writeKey: string,
    codeChallenge: string,
  ): string {
    const params = new URLSearchParams({
      client_id: config.oauth.client_id,
      redirect_uri: config.oauth.callback || '',
      response_type: 'code',
      state: writeKey,
      scope: this.PKCE_SCOPES.join(' '),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${config.oauth.authorization_endpoint}?${params.toString()}`;
  }

  static async pollForAuthCode(
    config: OAuthConfig,
    readKey: string,
  ): Promise<string> {
    if (!config.oauth.read_code) {
      throw new OAuthError(
        OAuthErrorType.INVALID_CONFIG,
        'OAuth config missing read_code endpoint',
      );
    }

    // Replace CODE_PLACEHOLDER in the URL with the actual read key
    const readCodeUrl = config.oauth.read_code.replace(
      'CODE_PLACEHOLDER',
      readKey,
    );

    return new Promise((resolve, reject) => {
      let stopped = false;
      let pollTimeoutId: ReturnType<typeof setTimeout> | null = null;

      const poll = async () => {
        if (stopped) return;

        try {
          const response = await fetch(readCodeUrl);

          if (stopped) return;

          if (response.ok) {
            const data = await response.json();
            if (data.oauth_code) {
              stopped = true;
              resolve(data.oauth_code);
              return;
            }
          }

          // Continue polling if no code yet
          if (!stopped) {
            pollTimeoutId = setTimeout(poll, this.POLLING_INTERVAL);
          }
        } catch (error) {
          console.error('Poll error:', error);
          if (!stopped) {
            pollTimeoutId = setTimeout(poll, this.POLLING_INTERVAL);
          }
        }
      };

      // Start polling
      poll();

      // Timeout after 10 minutes
      const timeoutId = setTimeout(
        () => {
          stopped = true;
          if (pollTimeoutId) {
            clearTimeout(pollTimeoutId);
          }
          reject(
            new OAuthError(
              OAuthErrorType.AUTH_TIMEOUT,
              'Authorization timed out',
            ),
          );
        },
        10 * 60 * 1000,
      );

      // Clean up timeout if resolved early
      const originalResolve = resolve;
      resolve = ((value: string) => {
        clearTimeout(timeoutId);
        originalResolve(value);
      }) as typeof resolve;
    });
  }

  static async exchangeCodeForTokens(
    config: OAuthConfig,
    code: string,
    codeVerifier: string,
  ): Promise<OAuthTokens> {
    try {
      const response = await fetch(config.oauth.token_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          code_verifier: codeVerifier,
          client_id: config.oauth.client_id,
          redirect_uri: config.oauth.callback || '',
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Token exchange failed: ${response.status} ${response.statusText}`,
        );
      }

      const tokenData: TokenResponse = await response.json();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type,
        expiresAt: Date.now() + tokenData.expires_in * 1000,
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to obtain access tokens');
    }
  }

  static async performPKCEFlow(
    studioUrl: string = this.DEFAULT_STUDIO_URL,
  ): Promise<{ tokens: OAuthTokens; config: OAuthConfig }> {
    try {
      // 1. Fetch OAuth configuration
      const config = await this.fetchOAuthConfig(studioUrl);

      // 2. Generate keypair
      const keypair = await this.generateKeypair(config);
      const { codeVerifier, codeChallenge } = await this.generatePKCEPair();

      // 3. Build authorization URL and open window
      const authUrl = this.buildAuthorizationUrl(
        config,
        keypair.write_key,
        codeChallenge,
      );
      const authWindow = window.open(authUrl, '_blank');

      // 4. Poll for authorization completion
      const authCode = await this.pollForAuthCode(config, keypair.read_key);

      // 5. Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(
        config,
        authCode,
        codeVerifier,
      );

      // Close the auth window if it's still open
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }

      return { tokens, config };
    } catch (error) {
      console.error('PKCE OAuth flow error:', error);

      if (error instanceof OAuthError) {
        throw error;
      }

      throw new OAuthError(
        OAuthErrorType.NETWORK_ERROR,
        `OAuth flow failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // ============================================
  // Device Code Flow (New backend - api-staging/api-production)
  // ============================================

  /**
     * Request a device authorization code (Device Code Flow)
     * RFC 8628: OAuth 2.0 Device Authorization Grant
     */
  static async requestDeviceCode(
    studioUrl: string,
    clientId: string = this.DEFAULT_CLIENT_ID,
    scope: string = this.DEFAULT_SCOPE,
  ): Promise<DeviceAuthorizationResponse> {
    const apiBaseUrl = this.getApiBaseUrl(studioUrl);
    const authorizeDeviceUrl = `${apiBaseUrl}/oauth/authorize_device`;

    try {
      const requestBody = new URLSearchParams({
        client_id: clientId,
        scope,
      });

      const response = await fetch(authorizeDeviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: 'unknown', error_description: errorText };
        }

        console.error(
          '[OAuth] Device code request failed:',
          response.status,
          errorData,
        );

        throw new OAuthError(
          OAuthErrorType.DEVICE_CODE_REQUEST_FAILED,
          `Failed to request device code: ${response.status} ${response.statusText}. ${errorData.error_description || ''}`,
          'Unable to start authorization. Please try again.',
        );
      }

      const data: DeviceAuthorizationResponse = await response.json();

      // Validate response structure
      if (
        !data.device_code
        || !data.user_code
        || !data.verification_uri
        || !data.expires_in
        || !data.interval
      ) {
        throw new OAuthError(
          OAuthErrorType.INVALID_CONFIG,
          'Invalid device authorization response: missing required fields',
        );
      }

      return data;
    } catch (error) {
      if (error instanceof OAuthError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new OAuthError(
        OAuthErrorType.DEVICE_CODE_REQUEST_FAILED,
        `Failed to request device authorization code: ${errorMessage}`,
        'Unable to start authorization. Please check your connection and try again.',
      );
    }
  }

  /**
     * Poll for access token using device code (Device Code Flow)
     * RFC 8628: OAuth 2.0 Device Authorization Grant
     */
  static async pollForToken(
    studioUrl: string,
    deviceCode: string,
    interval: number,
    expiresIn: number,
    clientId: string = this.DEFAULT_CLIENT_ID,
    signal?: AbortSignal,
  ): Promise<OAuthTokens> {
    const apiBaseUrl = this.getApiBaseUrl(studioUrl);
    const tokenUrl = `${apiBaseUrl}/oauth/token`;
    const startTime = Date.now();
    const expirationTime = startTime + expiresIn * 1000;
    let currentInterval = interval * 1000; // Convert to milliseconds

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          // Check if cancelled
          if (signal?.aborted) {
            reject(
              new OAuthError(
                OAuthErrorType.AUTH_TIMEOUT,
                'Authorization cancelled by user',
              ),
            );
            return;
          }

          // Check if device code has expired
          if (Date.now() >= expirationTime) {
            reject(
              new OAuthError(
                OAuthErrorType.DEVICE_CODE_EXPIRED,
                'Device code expired before authorization',
                'The authorization code has expired. Please try again.',
              ),
            );
            return;
          }

          const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: clientId,
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
              device_code: deviceCode,
            }),
          });

          if (response.ok) {
            // Success! User has authorized
            const tokenData: TokenResponse = await response.json();

            if (!tokenData.access_token) {
              reject(
                new OAuthError(
                  OAuthErrorType.TOKEN_EXCHANGE_FAILED,
                  'Invalid token response: missing access_token',
                ),
              );
              return;
            }

            resolve({
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token || '',
              tokenType: tokenData.token_type || 'Bearer',
              expiresAt: Date.now() + (tokenData.expires_in || 86400) * 1000,
            });
            return;
          }

          // Handle error responses
          const errorData = await response.json().catch(() => ({}));
          const errorCode = errorData.error;

          if (errorCode === 'authorization_pending') {
            // User hasn't authorized yet, continue polling
            if (signal?.aborted) return;
            setTimeout(poll, currentInterval);
            return;
          }

          if (errorCode === 'slow_down') {
            // Polling too fast, increase interval
            currentInterval += 5000; // Add 5 seconds
            if (signal?.aborted) return;
            setTimeout(poll, currentInterval);
            return;
          }

          if (errorCode === 'expired_token') {
            reject(
              new OAuthError(
                OAuthErrorType.DEVICE_CODE_EXPIRED,
                'Device code expired',
                'The authorization code has expired. Please try again.',
              ),
            );
            return;
          }

          if (
            errorCode === 'invalid_grant'
            || errorCode === 'invalid_request'
          ) {
            reject(
              new OAuthError(
                OAuthErrorType.INVALID_DEVICE_CODE,
                `Invalid device code: ${errorCode}`,
                'Invalid authorization code. Please try again.',
              ),
            );
            return;
          }

          // Unknown error
          const errorDescription = errorData.error_description;
          reject(
            new OAuthError(
              OAuthErrorType.TOKEN_EXCHANGE_FAILED,
              `Token exchange failed: ${errorCode || response.statusText}. ${errorDescription || ''}`,
              'Failed to complete authentication. Please try again.',
            ),
          );
        } catch (error) {
          if (error instanceof OAuthError) {
            reject(error);
            return;
          }

          // Network error, continue polling
          if (signal?.aborted) return;
          setTimeout(poll, currentInterval);
        }
      };

      // Start polling
      poll();
    });
  }

  /**
     * Refresh OAuth tokens
     */
  static async refreshTokens(
    config: OAuthConfig | null,
    refreshToken: string,
    studioUrl?: string,
  ): Promise<OAuthTokens> {
    const apiBaseUrl = studioUrl
      ? this.getApiBaseUrl(studioUrl)
      : 'https://api.tokens.studio';
    const tokenUrl = config?.oauth?.token_endpoint || `${apiBaseUrl}/oauth/token`;
    const clientId = config?.oauth?.client_id || this.DEFAULT_CLIENT_ID;

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Token refresh failed: ${response.status} ${response.statusText}`,
        );
      }

      const tokenData: TokenResponse = await response.json();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type,
        expiresAt: Date.now() + tokenData.expires_in * 1000,
      };
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      throw new Error('Failed to refresh access tokens');
    }
  }

  /**
     * Check if tokens need refresh (5 minutes buffer)
     */
  static needsRefresh(tokens: OAuthTokens): boolean {
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    return Date.now() + bufferTime >= tokens.expiresAt;
  }

  /**
     * Perform Device Code Flow - Request device code and return it for UI display
     * The UI should then call pollForToken() to complete the flow
     */
  static async requestDeviceAuthorization(
    studioUrl: string = this.DEFAULT_STUDIO_URL,
    clientId: string = this.DEFAULT_CLIENT_ID,
    scope: string = this.DEFAULT_SCOPE,
  ): Promise<DeviceAuthorizationResponse> {
    return this.requestDeviceCode(studioUrl, clientId, scope);
  }

  /**
     * Complete Device Code Flow by polling for token
     * This should be called after the user has entered the code on the verification page
     */
  static async completeDeviceCodeFlow(
    studioUrl: string,
    deviceCode: string,
    interval: number,
    expiresIn: number,
    clientId: string = this.DEFAULT_CLIENT_ID,
    signal?: AbortSignal,
  ): Promise<OAuthTokens> {
    return this.pollForToken(
      studioUrl,
      deviceCode,
      interval,
      expiresIn,
      clientId,
      signal,
    );
  }
}
