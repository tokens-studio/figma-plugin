import {
  mockRootGetSharedPluginData, mockRootSetSharedPluginData,
} from '../../../../tests/__mocks__/figmaMock';
import { updateLocalTokensData } from '../updateLocalTokensData';
import { getTokenData } from '../../../plugin/node';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';

describe('updateLocalTokensData -> getTokenData roundtrip (LOCAL storage)', () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map<string, string>();

    mockRootSetSharedPluginData.mockReset();
    mockRootGetSharedPluginData.mockReset();

    mockRootSetSharedPluginData.mockImplementation((namespace: string, key: string, value: string) => {
      store.set(`${namespace}::${key}`, value);
    });

    mockRootGetSharedPluginData.mockImplementation((namespace: string, key: string) => store.get(`${namespace}::${key}`) ?? '');
  });

  it('persists edited tokens so they survive a simulated reload', async () => {
    const tokens = {
      global: [
        {
          type: TokenTypes.COLOR,
          name: 'colors.red',
          value: '#ff0000',
        },
      ],
    };
    const themes = [
      {
        id: 'light',
        name: 'Light',
        selectedTokenSets: {},
      },
    ];

    await updateLocalTokensData({
      tokens,
      themes,
      compressedTokens: '',
      compressedThemes: '',
      usedTokenSets: { global: 'enabled' } as never,
      activeTheme: {},
      updatedAt: '2022-07-26T10:00:00.000Z',
      checkForChanges: false,
      collapsedTokenSets: [],
      tokenFormat: TokenFormatOptions.Legacy,
      storageProvider: StorageProviderType.LOCAL,
      storageSize: 0,
    });

    // Simulate closing and reopening the plugin: read everything back fresh.
    const result = await getTokenData();

    expect(result?.values).toEqual(tokens);
    expect(result?.themes).toEqual(themes);
  });

  it('persists a second edit made after the initial save', async () => {
    const firstTokens = {
      global: [
        {
          type: TokenTypes.COLOR,
          name: 'colors.red',
          value: '#ff0000',
        },
      ],
    };
    const secondTokens = {
      global: [
        {
          type: TokenTypes.COLOR,
          name: 'colors.red',
          value: '#00ff00',
        },
        {
          type: TokenTypes.COLOR,
          name: 'colors.blue',
          value: '#0000ff',
        },
      ],
    };

    await updateLocalTokensData({
      tokens: firstTokens,
      themes: [],
      compressedTokens: '',
      compressedThemes: '',
      usedTokenSets: { global: 'enabled' } as never,
      activeTheme: {},
      updatedAt: '2022-07-26T10:00:00.000Z',
      checkForChanges: false,
      collapsedTokenSets: [],
      tokenFormat: TokenFormatOptions.Legacy,
      storageProvider: StorageProviderType.LOCAL,
      storageSize: 0,
    });

    await updateLocalTokensData({
      tokens: secondTokens,
      themes: [],
      compressedTokens: '',
      compressedThemes: '',
      usedTokenSets: { global: 'enabled' } as never,
      activeTheme: {},
      updatedAt: '2022-07-26T10:05:00.000Z',
      checkForChanges: false,
      collapsedTokenSets: [],
      tokenFormat: TokenFormatOptions.Legacy,
      storageProvider: StorageProviderType.LOCAL,
      storageSize: 0,
    });

    const result = await getTokenData();

    expect(result?.values).toEqual(secondTokens);
  });
});
