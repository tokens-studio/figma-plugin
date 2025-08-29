import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeCredentials } from '@/types/StorageType';
import {
  isUsingAppPassword,
  findAppPasswordCredentials,
  hasAppPasswordCredentials,
  BitbucketCredentials,
} from '../bitbucketMigration';

describe('bitbucketMigration', () => {
  const mockApiTokenCredential: BitbucketCredentials = {
    provider: StorageProviderType.BITBUCKET,
    name: 'Test API Token',
    id: 'test/repo',
    branch: 'main',
    filePath: 'tokens',
    username: 'test@example.com',
    apiToken: 'api-token-123',
    internalId: 'api-token-id',
  };

  const mockAppPasswordCredential: BitbucketCredentials = {
    provider: StorageProviderType.BITBUCKET,
    name: 'Test App Password',
    id: 'test/repo2',
    branch: 'main',
    filePath: 'tokens',
    username: 'test@example.com',
    secret: 'app-password-123',
    internalId: 'app-password-id',
  };

  const mockMixedCredentials: StorageTypeCredentials[] = [
    mockApiTokenCredential,
    mockAppPasswordCredential,
    {
      provider: StorageProviderType.GITHUB,
      name: 'GitHub Test',
      id: 'test/github-repo',
      branch: 'main',
      filePath: 'tokens',
      secret: 'github-token',
      internalId: 'github-id',
    },
  ];

  describe('isUsingAppPassword', () => {
    it('should return false for credentials with API token', () => {
      expect(isUsingAppPassword(mockApiTokenCredential)).toBe(false);
    });

    it('should return true for credentials with app password (secret) but no API token', () => {
      expect(isUsingAppPassword(mockAppPasswordCredential)).toBe(true);
    });

    it('should return false for credentials with both API token and secret (API token takes precedence)', () => {
      const mixedCredential: BitbucketCredentials = {
        ...mockAppPasswordCredential,
        apiToken: 'api-token-123',
      };
      expect(isUsingAppPassword(mixedCredential)).toBe(false);
    });

    it('should return false for credentials with neither API token nor secret', () => {
      const emptyCredential: BitbucketCredentials = {
        provider: StorageProviderType.BITBUCKET,
        name: 'Empty Test',
        id: 'test/repo',
        branch: 'main',
        filePath: 'tokens',
        username: 'test@example.com',
        internalId: 'empty-id',
      };
      expect(isUsingAppPassword(emptyCredential)).toBe(false);
    });
  });

  describe('findAppPasswordCredentials', () => {
    it('should find only Bitbucket credentials using app passwords', () => {
      const result = findAppPasswordCredentials(mockMixedCredentials);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockAppPasswordCredential);
    });

    it('should return empty array when no app password credentials exist', () => {
      const apiTokenOnlyCredentials = [mockApiTokenCredential];
      const result = findAppPasswordCredentials(apiTokenOnlyCredentials);
      expect(result).toHaveLength(0);
    });

    it('should return empty array when no Bitbucket credentials exist', () => {
      const nonBitbucketCredentials = [
        {
          provider: StorageProviderType.GITHUB,
          name: 'GitHub Test',
          id: 'test/github-repo',
          branch: 'main',
          filePath: 'tokens',
          secret: 'github-token',
          internalId: 'github-id',
        },
      ];
      const result = findAppPasswordCredentials(nonBitbucketCredentials);
      expect(result).toHaveLength(0);
    });
  });

  describe('hasAppPasswordCredentials', () => {
    it('should return true when app password credentials exist', () => {
      expect(hasAppPasswordCredentials(mockMixedCredentials)).toBe(true);
    });

    it('should return false when no app password credentials exist', () => {
      const apiTokenOnlyCredentials = [mockApiTokenCredential];
      expect(hasAppPasswordCredentials(apiTokenOnlyCredentials)).toBe(false);
    });

    it('should return false for empty credentials array', () => {
      expect(hasAppPasswordCredentials([])).toBe(false);
    });
  });
});
