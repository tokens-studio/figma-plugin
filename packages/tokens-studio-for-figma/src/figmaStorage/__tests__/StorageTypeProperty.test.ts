import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType } from '@/types/StorageType';
import { StorageTypeProperty, removeCredentialsFromSavedStorageType } from '../StorageTypeProperty';
import { setStorageType } from '@/plugin/asyncMessageHandlers/setStorageType';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

const SECRET = 'super-secret-credential-value';
const EMAIL = 'jane@example.com';

// Every credential-like field the plugin has ever held, plus a few it might hold one day.
const withCredentials = (storageType: Record<string, unknown>) => ({
  ...storageType,
  secret: SECRET,
  apiToken: SECRET,
  username: EMAIL,
  password: SECRET,
  token: SECRET,
  accessToken: SECRET,
  refreshToken: SECRET,
  additionalHeaders: [{ name: 'Authorization', value: `Bearer ${SECRET}` }],
}) as unknown as StorageType;

const providers: Record<string, unknown>[] = [
  { provider: StorageProviderType.LOCAL },
  {
    provider: StorageProviderType.URL, internalId: 'i', name: 'n', id: 'https://example.com',
  },
  {
    provider: StorageProviderType.JSONBIN, internalId: 'i', name: 'n', id: 'bin',
  },
  {
    provider: StorageProviderType.GITHUB, internalId: 'i', name: 'n', id: 'o/r', branch: 'main', filePath: 'tokens', baseUrl: '',
  },
  {
    provider: StorageProviderType.GITLAB, internalId: 'i', name: 'n', id: 'o/r', branch: 'main', filePath: 'tokens',
  },
  {
    provider: StorageProviderType.BITBUCKET, internalId: 'i', name: 'n', id: 'w/r', branch: 'main', filePath: 'tokens',
  },
  {
    provider: StorageProviderType.ADO, internalId: 'i', name: 'n', id: 'r', baseUrl: 'https://dev.azure.com/x', branch: 'main', filePath: 'tokens',
  },
  {
    provider: StorageProviderType.SUPERNOVA, internalId: 'i', name: 'n', id: 'x', designSystemUrl: 'https://supernova.io/ds', mapping: '{}',
  },
  {
    provider: StorageProviderType.GENERIC_VERSIONED_STORAGE, internalId: 'i', name: 'n', id: 'https://example.com', flow: 'Read/Write',
  },
  {
    provider: StorageProviderType.TOKENS_STUDIO_OAUTH, internalId: 'i', name: 'n', orgId: 'org', id: 'p', branch: 'main',
  },
];

const bitbucket = providers.find((p) => p.provider === StorageProviderType.BITBUCKET)!;

const storeInFile = (value: unknown) => {
  mockRootGetSharedPluginData.mockImplementation((namespace: string, key: string) => (
    namespace === 'tokens' && key === 'storageType' ? JSON.stringify(value) : ''
  ));
};

const lastWrittenStorageType = () => {
  const writes = mockRootSetSharedPluginData.mock.calls.filter(([, key]) => key === 'storageType');
  return writes[writes.length - 1]?.[2];
};

describe('StorageTypeProperty', () => {
  beforeEach(() => {
    mockRootSetSharedPluginData.mockReset();
    mockRootGetSharedPluginData.mockReset();
  });

  it.each(providers.map((p) => [p.provider, p]))('never writes a credential to shared plugin data (%s)', async (_, storageType) => {
    await StorageTypeProperty.write(withCredentials(storageType));

    const written = lastWrittenStorageType();
    expect(written).not.toContain(SECRET);
    expect(written).not.toContain(EMAIL);
    expect(JSON.parse(written)).toEqual(storageType);
  });

  it('never saves the Bitbucket token or email sent from the UI through SET_STORAGE_TYPE', async () => {
    await setStorageType({
      type: AsyncMessageTypes.SET_STORAGE_TYPE,
      storageType: { ...bitbucket, username: EMAIL, apiToken: SECRET } as unknown as StorageType,
    });

    const written = lastWrittenStorageType();
    expect(written).not.toContain(SECRET);
    expect(written).not.toContain(EMAIL);
    expect(JSON.parse(written)).toEqual(bitbucket);
  });

  it('never returns a credential read from shared plugin data', async () => {
    storeInFile(withCredentials(bitbucket));

    const read = await StorageTypeProperty.read();
    expect(JSON.stringify(read)).not.toContain(SECRET);
    expect(JSON.stringify(read)).not.toContain(EMAIL);
    expect(read).toEqual(bitbucket);
  });

  it.each([
    ['unparseable data', '{not json'],
    ['an empty value', ''],
  ])('reads %s as no storage type', async (_, raw) => {
    mockRootGetSharedPluginData.mockReturnValue(raw);

    expect(await StorageTypeProperty.read()).toBeNull();
  });

  it.each(['constructor', '__proto__', 'toString'])('does not throw on a stored provider named %s', async (provider) => {
    storeInFile({ provider, id: 'x', apiToken: SECRET });

    await expect(removeCredentialsFromSavedStorageType()).resolves.toBeUndefined();
    const read = await StorageTypeProperty.read();
    expect(read).toEqual({ provider, id: 'x' });
  });

  it('reads a legacy provider without resetting it to local', async () => {
    storeInFile({
      provider: 'tokensstudio', internalId: 'i', name: 'Legacy', id: 'project',
    });

    expect(await StorageTypeProperty.read()).toEqual({
      provider: 'tokensstudio', internalId: 'i', name: 'Legacy', id: 'project',
    });
  });
});

describe('removeCredentialsFromSavedStorageType', () => {
  beforeEach(() => {
    mockRootSetSharedPluginData.mockReset();
    mockRootGetSharedPluginData.mockReset();
  });

  it('removes a leaked Bitbucket token and email from an existing file', async () => {
    storeInFile({ ...bitbucket, username: EMAIL, apiToken: SECRET });

    await removeCredentialsFromSavedStorageType();

    const written = lastWrittenStorageType();
    expect(written).not.toContain(SECRET);
    expect(written).not.toContain(EMAIL);
    expect(JSON.parse(written)).toEqual(bitbucket);
  });

  it('removes an app password, generic storage headers and an email on its own', async () => {
    storeInFile({ ...bitbucket, secret: SECRET });
    await removeCredentialsFromSavedStorageType();
    expect(JSON.parse(lastWrittenStorageType())).toEqual(bitbucket);

    const generic = providers.find((p) => p.provider === StorageProviderType.GENERIC_VERSIONED_STORAGE)!;
    storeInFile({ ...generic, additionalHeaders: [{ name: 'Authorization', value: SECRET }] });
    await removeCredentialsFromSavedStorageType();
    expect(JSON.parse(lastWrittenStorageType())).toEqual(generic);

    storeInFile({ ...bitbucket, username: EMAIL });
    await removeCredentialsFromSavedStorageType();
    expect(JSON.parse(lastWrittenStorageType())).toEqual(bitbucket);
  });

  it('keeps fields this build does not know when cleaning a file', async () => {
    storeInFile({ ...bitbucket, fieldFromANewerVersion: 'kept', apiToken: SECRET });

    await removeCredentialsFromSavedStorageType();

    expect(JSON.parse(lastWrittenStorageType())).toEqual({ ...bitbucket, fieldFromANewerVersion: 'kept' });
  });

  it('never resets a legacy or unknown provider to local', async () => {
    const legacy = {
      provider: 'tokensstudio', internalId: 'i', name: 'Legacy', id: 'project',
    };
    storeInFile(legacy);

    await removeCredentialsFromSavedStorageType();
    expect(mockRootSetSharedPluginData).not.toHaveBeenCalled();

    storeInFile({ ...legacy, secret: SECRET });
    await removeCredentialsFromSavedStorageType();
    expect(JSON.parse(lastWrittenStorageType())).toEqual(legacy);
  });

  it.each([
    ['a clean file', JSON.stringify(providers.find((p) => p.provider === StorageProviderType.GITHUB))],
    ['a file without a storage type', ''],
    ['unparseable data', '{not json'],
    ['a non-object value', '"github"'],
  ])('does not write for %s', async (_, raw) => {
    mockRootGetSharedPluginData.mockReturnValue(raw);

    await removeCredentialsFromSavedStorageType();

    expect(mockRootSetSharedPluginData).not.toHaveBeenCalled();
  });

  it('does not throw when the file cannot be edited', async () => {
    storeInFile({ ...bitbucket, apiToken: SECRET });
    mockRootSetSharedPluginData.mockImplementation(() => {
      throw new Error('Cannot write to a read-only file');
    });

    await expect(removeCredentialsFromSavedStorageType()).resolves.toBeUndefined();
  });
});
