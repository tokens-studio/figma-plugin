import { mockRootGetSharedPluginData, mockGetAsync, mockSetAsync } from '../../../tests/__mocks__/figmaMock';
import { startup } from '../plugin';
import { TokenTypes } from '@/constants/TokenTypes';
import { StorageProviderType } from '@/constants/StorageProviderType';

describe('startup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('should check for and delete duplicate sync providers on startup', async () => {
    const duplicateProviders = [
      {
        id: 'six7/figma-tokens',
        provider: StorageProviderType.GITHUB,
        filePath: 'tokens.json',
        branch: 'main',
        internalId: 'id-1',
        secret: 'secret-1',
      },
      {
        id: 'six7/figma-tokens',
        provider: StorageProviderType.GITHUB,
        filePath: 'tokens.json',
        branch: 'main',
        internalId: 'id-2',
        secret: 'secret-2',
      },
    ];

    mockGetAsync.mockImplementation((key: string) => {
      if (key === 'apiProviders') {
        return JSON.stringify(duplicateProviders);
      }
      return Promise.resolve(null);
    });

    const result = await startup();

    // Verify only the first duplicate was kept
    expect(result.localApiProviders).toEqual([duplicateProviders[0]]);

    // Verify that clientStorage was updated to delete the duplicate
    expect(mockSetAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify([duplicateProviders[0]]));
  });
});
