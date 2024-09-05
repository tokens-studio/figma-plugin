// write a test for isSameCredentials function

import type { StorageProviderType } from '@sync-providers/types';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import isSameCredentials from './isSameCredentials';

describe('isSameCredentials', () => {
  it('should return true if the credentials are the same', () => {
    const storedJSONBin = {
      id: '123',
      provider: AVAILABLE_PROVIDERS.JSONBIN as StorageProviderType.JSONBIN,
    };
    const storedGitHub = {
      id: 'six7/figma-tokens',
      provider: AVAILABLE_PROVIDERS.GITHUB as StorageProviderType.GITHUB,
      filePath: 'tokens.json',
      branch: 'main',
      internalId: '123',
    };
    const correctCredentials = {
      id: '123',
      provider: AVAILABLE_PROVIDERS.JSONBIN as StorageProviderType.JSONBIN,
      secret: 'abc',
      name: 'foo',
    };
    const correctGitHubCredentials = {
      id: 'six7/figma-tokens',
      provider: AVAILABLE_PROVIDERS.GITHUB as StorageProviderType.GITHUB,
      secret: 'abc',
      name: 'figmatokens',
      filePath: 'tokens.json',
      branch: 'main',
    };
    const gitHubCredentialsWithDifferentBranch = {
      id: 'six7/figma-tokens',
      provider: AVAILABLE_PROVIDERS.GITHUB as StorageProviderType.GITHUB,
      secret: 'abc',
      name: 'figmatokens',
      filePath: 'tokens.json',
      branch: 'default',
      internalId: '123',
    };

    expect(isSameCredentials(correctCredentials, storedJSONBin)).toBe(true);
    expect(isSameCredentials({ ...correctCredentials, id: '456' }, storedJSONBin)).toBe(false);
    expect(isSameCredentials(correctGitHubCredentials, storedGitHub)).toBe(true);
    expect(isSameCredentials({ ...correctGitHubCredentials, filePath: 'tokens2.json' }, storedGitHub)).toBe(false);
    expect(isSameCredentials({ ...correctGitHubCredentials, branch: 'next' }, storedGitHub)).toBe(false);
    expect(isSameCredentials(gitHubCredentialsWithDifferentBranch, storedGitHub)).toBe(true);
  });
});
