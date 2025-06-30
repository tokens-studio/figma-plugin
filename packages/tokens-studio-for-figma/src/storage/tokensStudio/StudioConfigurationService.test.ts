import { StudioConfigurationService } from './StudioConfigurationService';

// Mock fetch globally
global.fetch = jest.fn();

describe('StudioConfigurationService', () => {
  let service: StudioConfigurationService;

  beforeEach(() => {
    service = StudioConfigurationService.getInstance();
    service.clearCache();
    (fetch as jest.Mock).mockClear();
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = StudioConfigurationService.getInstance();
      const instance2 = StudioConfigurationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getGraphQLHost', () => {
    it('should return default host when no baseUrl is provided', async () => {
      const host = await service.getGraphQLHost();
      expect(host).toBe('localhost:4200');
    });

    it('should return discovered host when baseUrl is provided', async () => {
      const mockConfig = {
        frontend_base_url: 'https://app.test.tokens.studio',
        auth_domain: 'https://auth.test.tokens.studio',
        legacy_graphql_endpoint: 'graphql.test.tokens.studio',
        auth_graphql_endpoint: 'https://auth.test.tokens.studio/graphql/',
        oauth: {
          authorization_endpoint: 'https://auth.test.tokens.studio/accounts/oauth/authorize/',
          token_endpoint: 'https://auth.test.tokens.studio/accounts/oauth/token/',
          client_id: null,
          generate_keypair: 'https://auth.test.tokens.studio/oauth-native/keypair/',
          read_code: 'https://auth.test.tokens.studio/oauth-native/code/CODE_PLACEHOLDER/',
          callback: 'https://auth.test.tokens.studio/oauth-native/callback/',
        },
        features: {},
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const host = await service.getGraphQLHost('https://app.test.tokens.studio');
      expect(host).toBe('graphql.test.tokens.studio');
    });

    it('should fallback to default host when discovery fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const host = await service.getGraphQLHost('https://invalid.url');
      expect(host).toBe('localhost:4200');
    });
  });

  describe('validateBaseUrl', () => {
    it('should return valid for accessible configuration endpoint', async () => {
      const mockConfig = {
        frontend_base_url: 'https://app.test.tokens.studio',
        auth_domain: 'https://auth.test.tokens.studio',
        legacy_graphql_endpoint: 'graphql.test.tokens.studio',
        auth_graphql_endpoint: 'https://auth.test.tokens.studio/graphql/',
        oauth: {
          authorization_endpoint: 'https://auth.test.tokens.studio/accounts/oauth/authorize/',
          token_endpoint: 'https://auth.test.tokens.studio/accounts/oauth/token/',
          client_id: null,
          generate_keypair: 'https://auth.test.tokens.studio/oauth-native/keypair/',
          read_code: 'https://auth.test.tokens.studio/oauth-native/code/CODE_PLACEHOLDER/',
          callback: 'https://auth.test.tokens.studio/oauth-native/callback/',
        },
        features: {},
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await service.validateBaseUrl('https://app.test.tokens.studio');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify the correct URL was called
      expect(fetch).toHaveBeenCalledWith(
        'https://app.test.tokens.studio/.well-known/plugin-config.json',
        expect.any(Object)
      );
    });

    it('should normalize URL without protocol and call with https', async () => {
      const mockConfig = {
        frontend_base_url: 'https://app.prod.tokens.studio',
        auth_domain: 'https://auth.prod.tokens.studio',
        legacy_graphql_endpoint: 'graphql.prod.tokens.studio',
        auth_graphql_endpoint: 'https://auth.prod.tokens.studio/graphql/',
        oauth: {
          authorization_endpoint: 'https://auth.prod.tokens.studio/accounts/oauth/authorize/',
          token_endpoint: 'https://auth.prod.tokens.studio/accounts/oauth/token/',
          client_id: null,
          generate_keypair: 'https://auth.prod.tokens.studio/oauth-native/keypair/',
          read_code: 'https://auth.prod.tokens.studio/oauth-native/code/CODE_PLACEHOLDER/',
          callback: 'https://auth.prod.tokens.studio/oauth-native/callback/',
        },
        features: {},
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await service.validateBaseUrl('app.prod.tokens.studio');
      expect(result.valid).toBe(true);

      // Verify the correct URL was called with https protocol
      expect(fetch).toHaveBeenCalledWith(
        'https://app.prod.tokens.studio/.well-known/plugin-config.json',
        expect.any(Object)
      );
    });

    it('should return invalid for inaccessible endpoint', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await service.validateBaseUrl('https://invalid.tokens.studio');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Configuration endpoint not accessible');
    });

    it('should return invalid for network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await service.validateBaseUrl('https://invalid.url');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('caching', () => {
    it('should cache configuration and return from cache on subsequent calls', async () => {
      const mockConfig = {
        frontend_base_url: 'https://app.test.tokens.studio',
        auth_domain: 'https://auth.test.tokens.studio',
        legacy_graphql_endpoint: 'graphql.test.tokens.studio',
        auth_graphql_endpoint: 'https://auth.test.tokens.studio/graphql/',
        oauth: {
          authorization_endpoint: 'https://auth.test.tokens.studio/accounts/oauth/authorize/',
          token_endpoint: 'https://auth.test.tokens.studio/accounts/oauth/token/',
          client_id: null,
          generate_keypair: 'https://auth.test.tokens.studio/oauth-native/keypair/',
          read_code: 'https://auth.test.tokens.studio/oauth-native/code/CODE_PLACEHOLDER/',
          callback: 'https://auth.test.tokens.studio/oauth-native/callback/',
        },
        features: {},
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      // First call should fetch from network
      const host1 = await service.getGraphQLHost('https://app.test.tokens.studio');
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const host2 = await service.getGraphQLHost('https://app.test.tokens.studio');
      expect(fetch).toHaveBeenCalledTimes(1); // Still only 1 call
      expect(host1).toBe(host2);
    });
  });
});
