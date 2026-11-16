import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { startup } from '../plugin';
import { TokenTypes } from '@/constants/TokenTypes';

describe('startup', () => {
  it('should work for an empty document', async () => {
    const result = await startup();
    expect(result).toEqual({
      settings: {},
      activeTheme: {},
      lastOpened: 0,
      onboardingExplainer: {
        exportSets: true,
        inspect: true,
        sets: true,
        syncProviders: true,
      },
      storageType: { provider: 'local' },
      localApiProviders: null,
      licenseKey: null,
      initialLoad: false,
      localTokenData: null,
      user: null,
      authData: null,
      oauthTokens: null,
      usedEmail: null,
      selectedExportThemes: [],
      activeOrganizationId: null,
    });
  });

  it('should work with token values', async () => {
    mockRootGetSharedPluginData.mockImplementation((namespace: string, key: string) => {
      if (key === 'values') {
        return JSON.stringify({
          global: [
            {
              type: TokenTypes.COLOR,
              name: '#ff0000',
              value: '#ff0000',
            },
          ],
        });
      }

      return '';
    });

    const result = await startup();
    expect(result).toEqual({
      settings: {},
      activeTheme: {},
      lastOpened: 0,
      onboardingExplainer: {
        exportSets: true,
        inspect: true,
        sets: true,
        syncProviders: true,
      },
      storageType: { provider: 'local' },
      localApiProviders: null,
      licenseKey: null,
      initialLoad: false,
      localTokenData: {
        activeTheme: {},
        checkForChanges: false,
        collapsedTokenSets: null,
        themes: [],
        tokenFormat: null,
        updatedAt: '',
        usedTokenSet: null,
        version: '',
        values: {
          global: [
            {
              type: TokenTypes.COLOR,
              name: '#ff0000',
              value: '#ff0000',
            },
          ],
        },
      },
      user: null,
      authData: null,
      oauthTokens: null,
      usedEmail: null,
      selectedExportThemes: [],
      activeOrganizationId: null,
    });
  });
});

const SECRET = 'super-secret-credential-value';
const bitbucket = {
  provider: StorageProviderType.BITBUCKET,
  internalId: 'i',
  name: 'Tokens',
  id: 'workspace/repo',
  branch: 'main',
  filePath: 'tokens',
};

describe('startup credential cleanup', () => {
  beforeEach(() => {
    mockRootSetSharedPluginData.mockReset();
    mockRootGetSharedPluginData.mockReset();
  });

  it('removes a leaked token from the file once, before the storage type is read', async () => {
    let stored = JSON.stringify({ ...bitbucket, username: 'jane@example.com', apiToken: SECRET });
    mockRootGetSharedPluginData.mockImplementation((namespace: string, key: string) => (
      namespace === 'tokens' && key === 'storageType' ? stored : ''
    ));
    mockRootSetSharedPluginData.mockImplementation((namespace: string, key: string, value: string) => {
      if (namespace === 'tokens' && key === 'storageType') stored = value;
    });

    const result = await startup();

    const storageTypeWrites = mockRootSetSharedPluginData.mock.calls.filter(([, key]) => key === 'storageType');
    expect(storageTypeWrites).toHaveLength(1);
    expect(stored).not.toContain(SECRET);
    expect(JSON.parse(stored)).toEqual(bitbucket);
    expect(result.storageType).toEqual(bitbucket);
  });

  it('still starts when the saved provider is named like an Object.prototype key', async () => {
    mockRootGetSharedPluginData.mockImplementation((namespace: string, key: string) => (
      namespace === 'tokens' && key === 'storageType' ? JSON.stringify({ provider: 'constructor', id: 'x' }) : ''
    ));

    await expect(startup()).resolves.toEqual(expect.objectContaining({
      storageType: { provider: 'constructor', id: 'x' },
    }));
  });

  it('does not write to a clean file', async () => {
    mockRootGetSharedPluginData.mockImplementation((namespace: string, key: string) => (
      namespace === 'tokens' && key === 'storageType' ? JSON.stringify(bitbucket) : ''
    ));

    await startup();

    expect(mockRootSetSharedPluginData.mock.calls.filter(([, key]) => key === 'storageType')).toHaveLength(0);
  });
});
