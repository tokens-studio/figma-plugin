import { StorageProviderType } from '@/constants/StorageProviderType';
import * as generateId from '@/utils/generateId';
import { removeSingleCredential, updateCredentials } from './credentials';
import isSameCredentials from './isSameCredentials';
import { prepareCredentialIdentity } from './credentialIdentity';

describe('updateCredentials', () => {
  const giteaCredential = {
    provider: StorageProviderType.GITEA,
    internalId: 'gitea-id',
    id: 'design/tokens',
    name: 'Gitea',
    baseUrl: 'https://git.example.com/gitea',
    branch: 'main',
    filePath: 'tokens.json',
    secret: 'original-token',
  };

  it.each([
    { baseUrl: 'https://other.example.com/gitea' },
    { baseUrl: 'https://git.example.com/another-installation' },
    { provider: StorageProviderType.GITHUB },
  ])('does not replace saved Gitea credentials across an installation boundary: %o', async (changes) => {
    const changed = { ...giteaCredential, ...changes, secret: 'new-token' };
    figma.clientStorage.getAsync.mockResolvedValue(JSON.stringify([giteaCredential]));
    await updateCredentials(changed);
    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith(
      'apiProviders',
      JSON.stringify([giteaCredential, changed]),
    );
  });

  it('keeps both installations selectable when the new configuration is prepared before saving', async () => {
    const prepared = prepareCredentialIdentity({ ...giteaCredential, baseUrl: 'https://other.example.com/gitea', secret: 'new-token' }, [giteaCredential]);
    expect(prepared.internalId).toBe('idMock');
    figma.clientStorage.getAsync.mockResolvedValue(JSON.stringify([giteaCredential]));
    await updateCredentials(prepared);
    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify([giteaCredential, prepared]));
    expect(isSameCredentials(giteaCredential, giteaCredential)).toBe(true);
    expect(isSameCredentials(prepared, prepared)).toBe(true);
    expect(isSameCredentials(giteaCredential, prepared)).toBe(false);
  });

  it('updates a saved Gitea token within the same normalized installation', async () => {
    const changed = { ...giteaCredential, baseUrl: 'https://GIT.example.com:443/gitea/', secret: 'new-token' };
    figma.clientStorage.getAsync.mockResolvedValue(JSON.stringify([giteaCredential]));
    await updateCredentials(changed);
    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify([changed]));
  });

  it('updates the same provider across branches without browser URL in the Figma sandbox', async () => {
    const originalURL = global.URL;
    const otherProvider = { ...giteaCredential, internalId: 'other-id', name: 'Separate connection' };
    let saved = JSON.stringify([giteaCredential, otherProvider]);
    figma.clientStorage.getAsync.mockImplementation(async () => saved);
    figma.clientStorage.setAsync.mockImplementation(async (_key, value) => { saved = value; });
    try {
      // Figma's main sandbox does not provide browser globals.
      global.URL = undefined as unknown as typeof URL;
      for (const branch of ['release', 'main', 'release', 'main']) {
        const changed = { ...giteaCredential, branch };
        await updateCredentials(changed);
        expect(JSON.parse(saved)).toEqual([changed, otherProvider]);
      }
    } finally {
      global.URL = originalURL;
      figma.clientStorage.getAsync.mockReset();
      figma.clientStorage.setAsync.mockReset();
    }
  });

  it('initializes Gitea URL parsing without a browser URL constructor', () => {
    const originalURL = global.URL;
    try {
      global.URL = undefined as unknown as typeof URL;
      jest.isolateModules(() => {
        const { normalizeGiteaUrl } = jest.requireActual('../storage/gitea');
        expect(normalizeGiteaUrl('https://GIT.example.com:443/gitea/')).toBe('https://git.example.com/gitea');
        expect(() => normalizeGiteaUrl('https://user:secret@git.example.com')).toThrow();
      });
    } finally {
      global.URL = originalURL;
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  const generateIdSpy = jest.spyOn(generateId, 'generateId').mockImplementation(() => 'idMock');

  // Mock id for test

  it('sets credentials when no credentials existed before', async () => {
    const apiObject = {
      id: '123',
      secret: 'foo',
      name: 'mytokens',
      provider: StorageProviderType.JSONBIN,
    };
    figma.clientStorage.getAsync
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(JSON.stringify([apiObject]));
    await updateCredentials(apiObject);

    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith(
      'apiProviders',
      JSON.stringify([{ ...apiObject, internalId: 'idMock' }]),
    );
    expect(generateIdSpy).toHaveBeenCalled();
  });

  it('updates credentials when there have been existing', async () => {
    const apiArray = [
      {
        id: '123',
        secret: 'abc',
        name: 'mytokens',
        provider: StorageProviderType.JSONBIN,
      },
    ];
    const newObject = {
      id: '456',
      secret: 'foo',
      name: 'mytokens',
      provider: StorageProviderType.JSONBIN,
    };
    const newArray = [
      ...apiArray,
      {
        ...newObject,
        internalId: 'idMock',
      },
    ];
    figma.clientStorage.getAsync.mockResolvedValue(JSON.stringify(apiArray));
    await updateCredentials(newObject);
    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify(newArray));
    expect(generateIdSpy).toHaveBeenCalled();
  });

  it('merges credentials when there have been existing that match', async () => {
    const apiArray = [
      {
        id: '123',
        secret: 'abc',
        name: 'mytokens',
        provider: StorageProviderType.JSONBIN,
      },
    ];
    const newObject = {
      id: '123',
      secret: 'abc',
      name: 'my new name',
      provider: StorageProviderType.JSONBIN,
    };
    const newArray = [newObject];
    figma.clientStorage.getAsync.mockResolvedValue(JSON.stringify(apiArray));
    await updateCredentials(newObject);
    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify(newArray));
  });

  it('merges credentials when there have been existing that match internalId', async () => {
    const apiArray = [
      {
        id: '123',
        internalId: 'abc',
        secret: 'abc',
        name: 'mytokens',
        provider: StorageProviderType.JSONBIN,
      },
    ];
    const newObject = {
      id: '456',
      internalId: 'abc',
      secret: 'abc',
      name: 'my new name',
      provider: StorageProviderType.JSONBIN,
    };
    const newArray = [newObject];
    figma.clientStorage.getAsync.mockResolvedValue(JSON.stringify(apiArray));
    await updateCredentials(newObject);
    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify(newArray));
  });

  it('does not save credentials if provider is TOKENS_STUDIO_OAUTH', async () => {
    const oauthObject = {
      id: '123',
      secret: 'token',
      name: 'oauth provider',
      provider: StorageProviderType.TOKENS_STUDIO_OAUTH,
      orgId: 'org123',
    };
    await updateCredentials(oauthObject);
    expect(figma.clientStorage.setAsync).not.toHaveBeenCalled();
  });
});

describe('removeSingleCredential', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('removes credential if found and only one entry existed', async () => {
    const apiObject = {
      id: '123',
      secret: 'foo',
      name: 'mytokens',
      provider: StorageProviderType.JSONBIN,
    };
    const oldArray = [apiObject];
    figma.clientStorage.getAsync.mockResolvedValue(JSON.stringify(oldArray));
    await removeSingleCredential(apiObject);

    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify([]));
  });

  it('removes credential if found and multiple existed', async () => {
    const apiObject = {
      id: '123',
      secret: 'foo',
      name: 'mytokens',
      provider: StorageProviderType.JSONBIN,
    };
    const otherObject = {
      id: '456',
      secret: 'bar',
      name: 'mytokens',
      provider: StorageProviderType.JSONBIN,
    };
    const oldArray = [apiObject, otherObject];
    figma.clientStorage.getAsync.mockResolvedValueOnce(JSON.stringify(oldArray));
    await removeSingleCredential(otherObject);

    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify([apiObject]));
  });
});
