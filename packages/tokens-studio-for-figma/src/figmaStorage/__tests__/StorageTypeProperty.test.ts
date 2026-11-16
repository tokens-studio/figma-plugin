import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType } from '@/types/StorageType';
import { StorageTypeProperty, removeCredentialsFromSavedStorageType } from '../StorageTypeProperty';
import { getSavedStorageType } from '@/plugin/node';

const SECRET = 'super-secret-credential-value';

// Every provider, with every credential-like field the plugin has ever held filled in.
const withCredentials = (storageType: Record<string, unknown>) => ({
  ...storageType,
  secret: SECRET,
  apiToken: SECRET,
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
    provider: StorageProviderType.BITBUCKET, internalId: 'i', name: 'n', id: 'w/r', username: 'u', branch: 'main', filePath: 'tokens',
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

describe('StorageTypeProperty', () => {
  beforeEach(() => {
    mockRootSetSharedPluginData.mockClear();
    mockRootGetSharedPluginData.mockReset();
  });

  it.each(providers.map((p) => [p.provider, p]))('never writes a credential to shared plugin data (%s)', async (_, storageType) => {
    await StorageTypeProperty.write(withCredentials(storageType));

    expect(mockRootSetSharedPluginData).toHaveBeenCalledTimes(1);
    const [, key, written] = mockRootSetSharedPluginData.mock.calls[0];
    expect(key).toBe('storageType');
    expect(written).not.toContain(SECRET);
    expect(JSON.parse(written)).toEqual(storageType);
  });

  it('never returns a credential read from shared plugin data', async () => {
    const bitbucket = providers.find((p) => p.provider === StorageProviderType.BITBUCKET)!;
    mockRootGetSharedPluginData.mockReturnValue(JSON.stringify(withCredentials(bitbucket)));

    const read = await StorageTypeProperty.read();
    expect(JSON.stringify(read)).not.toContain(SECRET);
    expect(read).toEqual(bitbucket);
  });

  it('removes a leaked Bitbucket apiToken from an existing file on load', async () => {
    const bitbucket = providers.find((p) => p.provider === StorageProviderType.BITBUCKET)!;
    mockRootGetSharedPluginData.mockImplementation((namespace: string, key: string) => (
      namespace === 'tokens' && key === 'storageType' ? JSON.stringify({ ...bitbucket, apiToken: SECRET }) : ''
    ));

    const storageType = await getSavedStorageType();

    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith('tokens', 'storageType', JSON.stringify(bitbucket));
    expect(storageType).toEqual(bitbucket);
  });

  it('does not rewrite a file that holds no credentials', () => {
    const github = providers.find((p) => p.provider === StorageProviderType.GITHUB)!;
    mockRootGetSharedPluginData.mockReturnValue(JSON.stringify(github));

    expect(removeCredentialsFromSavedStorageType()).toBe(false);
    expect(mockRootSetSharedPluginData).not.toHaveBeenCalled();
  });
});
