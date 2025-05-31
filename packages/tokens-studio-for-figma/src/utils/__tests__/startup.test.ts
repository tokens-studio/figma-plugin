import { mockRootGetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { startup } from '../plugin';
import { TokenTypes } from '@/constants/TokenTypes';

describe('startup', () => {
  it('should work for an empty document', async () => {
    const result = await startup();
    expect(result).toEqual({
      settings: {},
      activeTheme: {},
      authData: null,
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
      usedEmail: null,
      selectedExportThemes: [],
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
      authData: null,
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
      usedEmail: null,
      selectedExportThemes: [],
    });
  });
});
