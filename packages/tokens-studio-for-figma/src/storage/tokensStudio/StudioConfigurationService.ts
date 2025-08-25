/**
 * Studio Configuration Service
 *
 * This service handles discovery and management of Studio instance configurations
 * by fetching configuration from /.well-known/plugin-config.json endpoints.
 */

export interface StudioOAuthConfiguration {
  authorization_endpoint: string;
  token_endpoint: string;
  client_id: string | null;
  generate_keypair: string;
  read_code: string;
  callback: string;
}

export interface StudioInstanceConfiguration {
  frontend_base_url: string;
  auth_domain: string;
  legacy_graphql_endpoint: string;
  auth_graphql_endpoint: string;
  oauth: StudioOAuthConfiguration;
  features: Record<string, any>;
}

export interface StudioConfigurationCache {
  [baseUrl: string]: {
    config: StudioInstanceConfiguration;
    timestamp: number;
    ttl: number;
  };
}

export class StudioConfigurationService {
  private static instance: StudioConfigurationService;

  private cache: StudioConfigurationCache = {};

  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private readonly DEFAULT_CONFIG_PATH = '/.well-known/plugin-config.json';

  private readonly DEVELOPMENT_GRAPHQL_HOST = 'localhost:4200';

  private readonly PRODUCTION_GRAPHQL_HOST = 'graphql.app.tokens.studio';

  private readonly DEFAULT_BASE_URL = 'https://app.prod.tokens.studio';

  private normalizedBaseUrl?: string;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // Sets and normalizes the base URL for subsequent operations
  public setBaseUrl(baseUrl: string): void {
    this.normalizedBaseUrl = this.normalizeBaseUrl(baseUrl);
  }

  // Gets the appropriate GraphQL host based on environment
  private getDefaultGraphQLHost(): string {
    return process.env.ENVIRONMENT === 'development'
      ? this.DEVELOPMENT_GRAPHQL_HOST
      : this.PRODUCTION_GRAPHQL_HOST;
  }

  // Gets the default base URL
  public getDefaultBaseUrl(): string {
    return this.DEFAULT_BASE_URL;
  }

  public static getInstance(): StudioConfigurationService {
    if (!StudioConfigurationService.instance) {
      StudioConfigurationService.instance = new StudioConfigurationService();
    }
    return StudioConfigurationService.instance;
  }

  /**
   * Discovers and returns the configuration for a Studio instance
   */
  public async discoverConfiguration(baseUrl: string): Promise<StudioInstanceConfiguration> {
    // Set and normalize base URL if not already set or different
    if (!this.normalizedBaseUrl || this.normalizedBaseUrl !== this.normalizeBaseUrl(baseUrl)) {
      this.setBaseUrl(baseUrl);
    }

    // Check cache first
    const cached = this.getCachedConfiguration(this.normalizedBaseUrl!);
    if (cached) {
      return cached;
    }

    try {
      const configUrl = `${this.normalizedBaseUrl}${this.DEFAULT_CONFIG_PATH}`;
      const response = await fetch(configUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read response');
        throw new Error(`Failed to fetch configuration: ${response.status} ${response.statusText}. Response: ${errorText}`);
      }

      const config: StudioInstanceConfiguration = await response.json();

      // Validate the configuration
      this.validateConfiguration(config);

      // Cache the configuration
      this.cacheConfiguration(this.normalizedBaseUrl!, config);

      return config;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to discover configuration for ${this.normalizedBaseUrl}:`, error);

      // Log more details about the error for debugging
      if (error instanceof Error) {
        // eslint-disable-next-line no-console
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }

      // Return fallback configuration for known Studio instances
      return this.getFallbackConfiguration(this.normalizedBaseUrl!);
    }
  }

  /**
   * Gets the GraphQL host for a Studio instance
   */
  public async getGraphQLHost(baseUrl?: string): Promise<string> {
    if (!baseUrl) {
      // When no baseUrl is provided, use the default base URL and fetch its configuration
      try {
        const config = await this.discoverConfiguration(this.DEFAULT_BASE_URL);
        // Extract host from legacy_graphql_endpoint
        const url = new URL(`https://${config.legacy_graphql_endpoint}`);
        return url.host;
      } catch (error) {
        // Fallback to environment-specific default if configuration discovery fails
        return this.getDefaultGraphQLHost();
      }
    }

    try {
      const config = await this.discoverConfiguration(baseUrl);
      // Extract host from legacy_graphql_endpoint
      const url = new URL(`https://${config.legacy_graphql_endpoint}`);
      return url.host;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to get GraphQL host for baseUrl:', baseUrl, error);

      // For custom Studio instances, try to construct a reasonable fallback based on the baseUrl
      // Use cached normalized URL if available, otherwise normalize it
      if (!this.normalizedBaseUrl || this.normalizedBaseUrl !== this.normalizeBaseUrl(baseUrl)) {
        this.setBaseUrl(baseUrl);
      }
      const url = new URL(this.normalizedBaseUrl!);
      const domain = url.hostname;

      // Special handling for known tokens.studio domains
      if (domain.includes('tokens.studio')) {
        // Use environment-specific default for tokens.studio domains
        return this.getDefaultGraphQLHost();
      }

      // For custom Studio instances, construct a GraphQL endpoint based on the domain
      return `graphql.${domain}`;
    }
  }

  /**
   * Gets the full configuration for a Studio instance
   */
  public async getConfiguration(baseUrl?: string): Promise<StudioInstanceConfiguration | null> {
    const targetUrl = baseUrl || this.DEFAULT_BASE_URL;

    try {
      return await this.discoverConfiguration(targetUrl);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to get configuration:', error);
      return null;
    }
  }

  /**
   * Validates if a base URL is accessible and has valid configuration
   */
  public async validateBaseUrl(baseUrl: string): Promise<{ valid: boolean; error?: string }> {
    try {
      if (!this.normalizedBaseUrl || this.normalizedBaseUrl !== this.normalizeBaseUrl(baseUrl)) {
        this.setBaseUrl(baseUrl);
      }
      const configUrl = `${this.normalizedBaseUrl}${this.DEFAULT_CONFIG_PATH}`;

      const response = await fetch(configUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read response');
        return {
          valid: false,
          error: `Configuration endpoint not accessible: ${response.status} ${response.statusText}. Response: ${errorText}`,
        };
      }

      const config = await response.json();
      this.validateConfiguration(config);

      return { valid: true };
    } catch (error) {
      let errorMessage = 'Unknown validation error';
      if (error instanceof Error) {
        errorMessage = error.message;
        // Provide helpful message for CORS errors
        if (errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
          errorMessage = 'Configuration endpoint exists but CORS headers are not configured. The Studio backend team needs to add CORS headers to allow plugin access.';
        }
      }
      return {
        valid: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Clears the configuration cache
   */
  public clearCache(): void {
    this.cache = {};
  }

  /**
   * Clears expired cache entries
   */
  public clearExpiredCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach((key) => {
      const entry = this.cache[key];
      if (now - entry.timestamp > entry.ttl) {
        delete this.cache[key];
      }
    });
  }

  private normalizeBaseUrl(baseUrl: string): string {
    // Remove trailing slash and ensure https protocol
    let normalized = baseUrl.replace(/\/$/, '');
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    return normalized;
  }

  private getCachedConfiguration(baseUrl: string): StudioInstanceConfiguration | null {
    const cached = this.cache[baseUrl];
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      delete this.cache[baseUrl];
      return null;
    }

    return cached.config;
  }

  private cacheConfiguration(baseUrl: string, config: StudioInstanceConfiguration): void {
    this.cache[baseUrl] = {
      config,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL,
    };
  }

  private validateConfiguration(config: any): void {
    const requiredFields = [
      'frontend_base_url',
      'auth_domain',
      'legacy_graphql_endpoint',
      'auth_graphql_endpoint',
      'oauth',
    ];

    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Missing required configuration field: ${field}`);
      }
    }

    // Validate OAuth configuration
    const requiredOAuthFields = [
      'authorization_endpoint',
      'token_endpoint',
      'generate_keypair',
      'read_code',
      'callback',
    ];

    for (const field of requiredOAuthFields) {
      if (!config.oauth[field]) {
        throw new Error(`Missing required OAuth configuration field: ${field}`);
      }
    }
  }

  private getFallbackConfiguration(baseUrl: string): StudioInstanceConfiguration {
    // Provide fallback configuration for known Studio instances
    const url = new URL(baseUrl);
    const domain = url.hostname;

    // Special handling for known tokens.studio domains
    if (domain.includes('tokens.studio')) {
      // Use the current environment's default configuration
      // This ensures compatibility with the existing Studio setup
      return {
        frontend_base_url: baseUrl,
        auth_domain: `https://auth.${domain}`,
        legacy_graphql_endpoint: process.env.TOKENS_STUDIO_API_HOST || this.DEVELOPMENT_GRAPHQL_HOST,
        auth_graphql_endpoint: `https://auth.${domain}/graphql/`,
        oauth: {
          authorization_endpoint: `https://auth.${domain}/accounts/oauth/authorize/`,
          token_endpoint: `https://auth.${domain}/accounts/oauth/token/`,
          client_id: null,
          generate_keypair: `https://auth.${domain}/oauth-native/keypair/`,
          read_code: `https://auth.${domain}/oauth-native/code/CODE_PLACEHOLDER/`,
          callback: `https://auth.${domain}/oauth-native/callback/`,
        },
        features: {},
      };
    }

    // Default fallback configuration
    return {
      frontend_base_url: baseUrl,
      auth_domain: `https://auth.${domain}`,
      legacy_graphql_endpoint: `graphql.${domain}`,
      auth_graphql_endpoint: `https://auth.${domain}/graphql/`,
      oauth: {
        authorization_endpoint: `https://auth.${domain}/accounts/oauth/authorize/`,
        token_endpoint: `https://auth.${domain}/accounts/oauth/token/`,
        client_id: null,
        generate_keypair: `https://auth.${domain}/oauth-native/keypair/`,
        read_code: `https://auth.${domain}/oauth-native/code/CODE_PLACEHOLDER/`,
        callback: `https://auth.${domain}/oauth-native/callback/`,
      },
      features: {},
    };
  }
}
