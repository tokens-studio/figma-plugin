// write a test for isSameCredentials function

import { StorageProviderType } from '@/constants/StorageProviderType';
import isSameCredentials from './isSameCredentials';
import { matchesCredentialById, prepareCredentialIdentity } from './credentialIdentity';

describe('isSameCredentials', () => {
  describe('Gitea installation boundaries', () => {
    const credential = {
      provider: StorageProviderType.GITEA,
      id: 'design/tokens',
      name: 'Gitea',
      baseUrl: 'https://git.example.com/gitea',
      branch: 'main',
      filePath: 'tokens.json',
      secret: 'private-token',
    };

    it('normalizes installation URLs for fallback matching', () => {
      expect(isSameCredentials(credential, { ...credential, baseUrl: 'https://GIT.example.com:443/gitea/' })).toBe(
        true,
      );
    });

    it.each([
      { baseUrl: 'https://other.example.com/gitea' },
      { baseUrl: 'https://git.example.com/another-installation' },
      { id: 'other/tokens' },
      { branch: 'other' },
      { filePath: 'other.json' },
      { baseUrl: 'not a URL' },
    ])('does not fallback-match a changed scope: %o', (changes) => {
      expect(isSameCredentials(credential, { ...credential, ...changes })).toBe(false);
    });

    it.each([
      { baseUrl: 'https://other.example.com/gitea' },
      { baseUrl: 'https://git.example.com/another-installation' },
      { baseUrl: 'not a URL' },
      { provider: StorageProviderType.GITHUB },
    ])('rejects a changed installation/provider even with the same internalId: %o', (changes) => {
      expect(
        isSameCredentials(
          { ...credential, internalId: 'same-id' },
          { ...credential, ...changes, internalId: 'same-id' },
        ),
      ).toBe(false);
    });

    it('rejects a cross-provider match in the other direction', () => {
      expect(
        isSameCredentials(
          { ...credential, provider: StorageProviderType.GITHUB, internalId: 'same-id' },
          { ...credential, internalId: 'same-id' },
        ),
      ).toBe(false);
    });

    it('retains internalId matching within the trusted installation', () => {
      expect(
        isSameCredentials(
          { ...credential, internalId: 'same-id' },
          { ...credential, branch: 'next', internalId: 'same-id' },
        ),
      ).toBe(true);
    });
  });

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
      provider: StorageProviderType.TOKENS_STUDIO_OAUTH,
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
      provider: StorageProviderType.TOKENS_STUDIO_OAUTH,
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

describe('credential identity matching', () => {
  const credential = {
    provider: StorageProviderType.GITEA,
    internalId: 'same-id',
    id: 'owner/repo',
    name: 'Gitea',
    baseUrl: 'https://git.example.com/gitea',
    branch: 'main',
    filePath: 'tokens.json',
    secret: 'saved-pat',
  };

  it.each([
    { baseUrl: 'https://other.example.com/gitea' },
    { baseUrl: 'https://git.example.com/other' },
    { baseUrl: 'not a URL' },
    { provider: StorageProviderType.GITHUB },
  ])('does not treat the internalId as permission to reuse a secret across scopes: %o', (changes) => {
    expect(matchesCredentialById(credential, { ...credential, ...changes })).toBe(false);
  });

  it('recognizes normalized installation identity independently of branch changes', () => {
    expect(matchesCredentialById(credential, { ...credential, baseUrl: 'https://GIT.example.com:443/gitea/', branch: 'next' })).toBe(true);
  });

  it('requires an actual identifier rather than matching two absent identifiers', () => {
    expect(matchesCredentialById({ ...credential, internalId: '' }, { ...credential, internalId: '' })).toBe(false);
  });

  it('preserves identifier matching for existing providers without a registered secret scope', () => {
    expect(matchesCredentialById({ ...credential, provider: StorageProviderType.GITHUB }, { ...credential, provider: StorageProviderType.GITHUB, branch: 'next' })).toBe(true);
  });
});

describe('prepareCredentialIdentity', () => {
  const credential = {
    provider: StorageProviderType.GITEA,
    internalId: 'saved-id',
    id: 'owner/repo',
    name: 'Gitea',
    baseUrl: 'https://git.example.com/gitea',
    branch: 'main',
    filePath: 'tokens.json',
    secret: 'saved-pat',
  };

  it.each(['https://other.example.com/gitea', 'https://git.example.com/other'])('assigns a new identity before persisting a configuration moved to %s', (baseUrl) => {
    const storedCredentials = [credential];
    const prepared = prepareCredentialIdentity({ ...credential, baseUrl }, storedCredentials);
    expect(prepared.internalId).toHaveLength(24);
    expect(prepared.internalId).not.toEqual(credential.internalId);
    expect(storedCredentials).toEqual([credential]);
    expect(matchesCredentialById(credential, credential)).toBe(true);
    expect(matchesCredentialById(credential, prepared)).toBe(false);
  });

  it('preserves the identity when editing within the same normalized installation', () => {
    const context = {
      ...credential, baseUrl: 'https://GIT.example.com:443/gitea/', branch: 'next', secret: 'new-pat',
    };
    expect(prepareCredentialIdentity(context, [credential])).toBe(context);
  });

  it('preserves existing provider identities when no additional scope policy applies', () => {
    const context = { ...credential, provider: StorageProviderType.GITHUB, baseUrl: 'https://other.example.com' };
    expect(prepareCredentialIdentity(context, [{ ...credential, provider: StorageProviderType.GITHUB }])).toBe(context);
  });

  it('does not invent an identifier for local storage or a new configuration', () => {
    const local = { provider: StorageProviderType.LOCAL };
    const context = { ...credential, internalId: '' };
    expect(prepareCredentialIdentity(local, [credential])).toBe(local);
    expect(prepareCredentialIdentity(context, [credential])).toBe(context);
  });
});
