import { buildStudioUrl, isTokensStudioStorage } from '../studioUrlBuilder';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokensStudioStorageType } from '@/types/StorageType';

describe('studioUrlBuilder', () => {
  const mockStorageConfig: TokensStudioStorageType = {
    provider: StorageProviderType.TOKENS_STUDIO,
    internalId: 'test-internal-id',
    name: 'Test Project',
    orgId: 'mytrialorg',
    id: 'ppp',
    baseUrl: 'https://app.prod.tokens.studio',
  };

  describe('buildStudioUrl', () => {
    it('builds project URL when no options provided', () => {
      const result = buildStudioUrl(mockStorageConfig);
      expect(result).toBe('https://app.prod.tokens.studio/org/mytrialorg/project/ppp');
    });

    it('builds project URL when empty options provided', () => {
      const result = buildStudioUrl(mockStorageConfig, {});
      expect(result).toBe('https://app.prod.tokens.studio/org/mytrialorg/project/ppp');
    });

    it('builds token set URL when tokenSetName provided', () => {
      const result = buildStudioUrl(mockStorageConfig, { tokenSetName: 'test' });
      expect(result).toBe('https://app.prod.tokens.studio/org/mytrialorg/project/ppp/data/main/tokens/set/test');
    });

    it('builds token URL when both tokenSetName and tokenName provided', () => {
      const result = buildStudioUrl(mockStorageConfig, { 
        tokenSetName: 'test', 
        tokenName: 'asdf' 
      });
      expect(result).toBe('https://app.prod.tokens.studio/org/mytrialorg/project/ppp/data/main/tokens/set/test?token=asdf');
    });

    it('handles token names that need URL encoding', () => {
      const result = buildStudioUrl(mockStorageConfig, { 
        tokenSetName: 'test', 
        tokenName: 'token with spaces' 
      });
      expect(result).toBe('https://app.prod.tokens.studio/org/mytrialorg/project/ppp/data/main/tokens/set/test?token=token%20with%20spaces');
    });

    it('uses custom baseUrl when provided', () => {
      const customConfig = {
        ...mockStorageConfig,
        baseUrl: 'https://custom.tokens.studio',
      };
      const result = buildStudioUrl(customConfig, { tokenSetName: 'test' });
      expect(result).toBe('https://custom.tokens.studio/org/mytrialorg/project/ppp/data/main/tokens/set/test');
    });

    it('removes trailing slash from baseUrl', () => {
      const configWithTrailingSlash = {
        ...mockStorageConfig,
        baseUrl: 'https://app.prod.tokens.studio/',
      };
      const result = buildStudioUrl(configWithTrailingSlash);
      expect(result).toBe('https://app.prod.tokens.studio/org/mytrialorg/project/ppp');
    });

    it('uses default baseUrl when not provided', () => {
      const configWithoutBaseUrl = {
        ...mockStorageConfig,
        baseUrl: undefined,
      };
      const result = buildStudioUrl(configWithoutBaseUrl as TokensStudioStorageType);
      expect(result).toBe('https://app.prod.tokens.studio/org/mytrialorg/project/ppp');
    });
  });

  describe('isTokensStudioStorage', () => {
    it('returns true for valid Tokens Studio storage', () => {
      expect(isTokensStudioStorage(mockStorageConfig)).toBe(true);
    });

    it('returns false for non-Tokens Studio storage', () => {
      const gitHubStorage = {
        provider: StorageProviderType.GITHUB,
        internalId: 'test',
        name: 'Test',
        id: 'repo',
        branch: 'main',
        filePath: 'tokens.json',
      };
      expect(isTokensStudioStorage(gitHubStorage)).toBe(false);
    });

    it('returns false when orgId is missing', () => {
      const invalidConfig = {
        ...mockStorageConfig,
        orgId: undefined,
      };
      expect(isTokensStudioStorage(invalidConfig)).toBe(false);
    });

    it('returns false when id is missing', () => {
      const invalidConfig = {
        ...mockStorageConfig,
        id: undefined,
      };
      expect(isTokensStudioStorage(invalidConfig)).toBe(false);
    });

    it('returns false for null/undefined', () => {
      expect(isTokensStudioStorage(null)).toBe(false);
      expect(isTokensStudioStorage(undefined)).toBe(false);
    });
  });
});