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
        sets: true,
        inspect: true,
        syncProviders: true,
      },
      storageType: { provider: 'local' },
      localApiProviders: null,
      licenseKey: null,
      localTokenData: null,
      user: null,
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
        sets: true,
        inspect: true,
        syncProviders: true,
      },
      storageType: { provider: 'local' },
      localApiProviders: null,
      licenseKey: null,
      localTokenData: {
        activeTheme: {},
        checkForChanges: null,
        collapsedTokenSets: null,
        themes: [],
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
    });
  });
});
