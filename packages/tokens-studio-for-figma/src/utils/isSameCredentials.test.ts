// write a test for isSameCredentials function

import { StorageProviderType } from '@/constants/StorageProviderType';
import isSameCredentials from './isSameCredentials';

describe('isSameCredentials', () => {
  it('should return true if the credentials are the same', () => {
    const storedJSONBin = {
      id: '123',
      provider: StorageProviderType.JSONBIN,
    };
    const storedGitHub = {
      id: 'six7/figma-tokens',
      provider: StorageProviderType.GITHUB,
      filePath: 'tokens.json',
      branch: 'main',
      internalId: '123',
    };
    const storedSupernova = {
      id: '456',
      provider: StorageProviderType.SUPERNOVA,
      designSystemUrl: 'https://example.com',
      mapping: { foo: 'bar' },
    };
    const storedTokensStudio = {
      id: '789',
      provider: StorageProviderType.TOKENS_STUDIO,
      orgId: 'org123',
      baseUrl: 'https://app.tokens.studio',
    };
    const correctCredentials = {
      id: '123',
      provider: StorageProviderType.JSONBIN,
      secret: 'abc',
      name: 'foo',
    };
    const correctGitHubCredentials = {
      id: 'six7/figma-tokens',
      provider: StorageProviderType.GITHUB,
      secret: 'abc',
      name: 'figmatokens',
      filePath: 'tokens.json',
      branch: 'main',
    };
    const gitHubCredentialsWithDifferentBranch = {
      id: 'six7/figma-tokens',
      provider: StorageProviderType.GITHUB,
      secret: 'abc',
      name: 'figmatokens',
      filePath: 'tokens.json',
      branch: 'default',
      internalId: '123',
    };
    const correctSupernovaCredentials = {
      id: '456',
      provider: StorageProviderType.SUPERNOVA,
      secret: 'def',
      name: 'supernova',
      designSystemUrl: 'https://example.com',
      mapping: { foo: 'bar' },
    };
    const correctTokensStudioCredentials = {
      id: '789',
      provider: StorageProviderType.TOKENS_STUDIO,
      secret: 'ghi',
      name: 'tokensstudio',
      orgId: 'org123',
      baseUrl: 'https://app.tokens.studio',
    };

    expect(isSameCredentials(correctCredentials, storedJSONBin)).toBe(true);
    expect(isSameCredentials({ ...correctCredentials, id: '456' }, storedJSONBin)).toBe(false);
    expect(isSameCredentials(correctGitHubCredentials, storedGitHub)).toBe(true);
    expect(isSameCredentials({ ...correctGitHubCredentials, filePath: 'tokens2.json' }, storedGitHub)).toBe(false);
    expect(isSameCredentials({ ...correctGitHubCredentials, branch: 'next' }, storedGitHub)).toBe(false);
    expect(isSameCredentials(gitHubCredentialsWithDifferentBranch, storedGitHub)).toBe(true);
    expect(isSameCredentials(correctSupernovaCredentials, storedSupernova)).toBe(true);
    expect(isSameCredentials({ ...correctSupernovaCredentials, designSystemUrl: 'https://different.com' }, storedSupernova)).toBe(false);
    expect(isSameCredentials({ ...correctSupernovaCredentials, mapping: { baz: 'qux' } }, storedSupernova)).toBe(false);
    expect(isSameCredentials(correctTokensStudioCredentials, storedTokensStudio)).toBe(true);
    expect(isSameCredentials({ ...correctTokensStudioCredentials, id: '987' }, storedTokensStudio)).toBe(false);
    expect(isSameCredentials({ ...correctTokensStudioCredentials, orgId: 'different-org' }, storedTokensStudio)).toBe(false);
    expect(isSameCredentials({ ...correctTokensStudioCredentials, baseUrl: 'https://different.tokens.studio' }, storedTokensStudio)).toBe(false);

    // Test with undefined baseUrl
    const storedTokensStudioNoBaseUrl = { ...storedTokensStudio, baseUrl: undefined };
    const correctTokensStudioNoBaseUrl = { ...correctTokensStudioCredentials, baseUrl: undefined };
    expect(isSameCredentials(correctTokensStudioNoBaseUrl, storedTokensStudioNoBaseUrl)).toBe(true);
    expect(isSameCredentials(correctTokensStudioCredentials, storedTokensStudioNoBaseUrl)).toBe(false);
  });

  it('should use internalId for comparison when available', () => {
    const storedWithInternalId = {
      id: 'old-id',
      provider: StorageProviderType.GITHUB,
      filePath: 'old-path.json',
      branch: 'old-branch',
      internalId: 'internal-123',
    };
    const credentialWithInternalId = {
      id: 'new-id',
      provider: StorageProviderType.GITHUB,
      filePath: 'new-path.json',
      branch: 'new-branch',
      internalId: 'internal-123',
    };

    expect(isSameCredentials(credentialWithInternalId, storedWithInternalId)).toBe(true);
  });

  it('should return false for unsupported provider types', () => {
    const unsupportedProvider = {
      id: '999',
      provider: 'UNSUPPORTED' as StorageProviderType,
    };
    const credential = {
      id: '999',
      provider: 'UNSUPPORTED' as StorageProviderType,
      secret: 'xyz',
      name: 'unsupported',
    };

    expect(isSameCredentials(credential, unsupportedProvider)).toBe(false);
  });
});
