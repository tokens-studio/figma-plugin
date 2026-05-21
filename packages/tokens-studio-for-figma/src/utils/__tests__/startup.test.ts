import { mockRootGetSharedPluginData, mockGetAsync } from '../../../tests/__mocks__/figmaMock';
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

  it('should deduplicate tokens studio providers on startup', async () => {
    mockGetAsync.mockImplementation((key: string) => {
      if (key === 'apiProviders') {
        return Promise.resolve(JSON.stringify([
          {
            id: 'd360dc7e-d730-42f6-8959-28f8e3d46d33',
            provider: 'tokensstudio',
            internalId: 'd360dc7e-d730-42f6-8959-28f8e3d46d33',
          },
          {
            id: 'proj3',
            orgId: 'd360dc7e-d730-42f6-8959-28f8e3d46d33',
            provider: 'tokensstudio-oauth',
            internalId: 'tokens-studio-d360dc7e-d730-42f6-8959-28f8e3d46d33',
          },
        ]));
      }
      return Promise.resolve(null);
    });

    const result = await startup();
    // The legacy tokensstudio provider should be filtered out because it is a duplicate of tokensstudiooauth!
    expect(result.localApiProviders).toEqual([
      {
        id: 'proj3',
        orgId: 'd360dc7e-d730-42f6-8959-28f8e3d46d33',
        provider: 'tokensstudio-oauth',
        internalId: 'tokens-studio-d360dc7e-d730-42f6-8959-28f8e3d46d33',
      },
    ]);
  });
});
