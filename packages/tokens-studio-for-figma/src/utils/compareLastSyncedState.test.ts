import { compareLastSyncedState } from './compareLastSyncedState';
import type { ThemeObjectsList } from '@/types';
import type { AnyTokenList } from '@/types/tokens';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';

describe('compareLastSyncedState', () => {
  const mockTokens: Record<string, AnyTokenList> = {
    global: [
      {
        name: 'colors.primary',
        value: '#ff0000',
        type: 'color',
      },
    ],
  };

  const mockThemes: ThemeObjectsList = [
    {
      id: 'light',
      name: 'Light',
      selectedTokenSets: {
        global: 'enabled',
      },
      $figmaStyleReferences: {},
    },
  ];

  const format: TokenFormatOptions = 'legacy';

  it('should return true when state matches', () => {
    const lastSyncedState = JSON.stringify([mockTokens, mockThemes, format], null, 2);
    const result = compareLastSyncedState(mockTokens, mockThemes, lastSyncedState, format);
    expect(result).toBe(true);
  });

  it('should return false when tokens differ', () => {
    const differentTokens: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'colors.primary',
          value: '#00ff00', // different value
          type: 'color',
        },
      ],
    };
    const lastSyncedState = JSON.stringify([mockTokens, mockThemes, format], null, 2);
    const result = compareLastSyncedState(differentTokens, mockThemes, lastSyncedState, format);
    expect(result).toBe(false);
  });

  it('should return false when themes differ', () => {
    const differentThemes: ThemeObjectsList = [
      {
        id: 'dark',
        name: 'Dark',
        selectedTokenSets: {
          global: 'enabled',
        },
        $figmaStyleReferences: {},
      },
    ];
    const lastSyncedState = JSON.stringify([mockTokens, mockThemes, format], null, 2);
    const result = compareLastSyncedState(mockTokens, differentThemes, lastSyncedState, format);
    expect(result).toBe(false);
  });

  it('should return false for invalid JSON', () => {
    const result = compareLastSyncedState(mockTokens, mockThemes, 'invalid json', format);
    expect(result).toBe(false);
  });

  it('should return false for empty string', () => {
    const result = compareLastSyncedState(mockTokens, mockThemes, '', format);
    expect(result).toBe(false);
  });

  it('should handle empty tokens and themes', () => {
    const emptyTokens = {};
    const emptyThemes: ThemeObjectsList = [];
    const lastSyncedState = JSON.stringify([emptyTokens, emptyThemes, format], null, 2);
    const result = compareLastSyncedState(emptyTokens, emptyThemes, lastSyncedState, format);
    expect(result).toBe(true);
  });

  it('should ignore token IDs in comparison', () => {
    const tokensWithId: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'colors.primary',
          value: '#ff0000',
          type: 'color',
          $extensions: {
            'studio.tokens': {
              id: 'some-id', // this should be ignored
            },
          },
        } as any,
      ],
    };
    const tokensWithoutId: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'colors.primary',
          value: '#ff0000',
          type: 'color',
        },
      ],
    };
    const lastSyncedState = JSON.stringify([tokensWithoutId, mockThemes, format], null, 2);
    const result = compareLastSyncedState(tokensWithId, mockThemes, lastSyncedState, format);
    expect(result).toBe(true);
  });

  it('should handle format changes', () => {
    const lastSyncedState = JSON.stringify([mockTokens, mockThemes, 'legacy'], null, 2);
    const result = compareLastSyncedState(mockTokens, mockThemes, lastSyncedState, 'w3c-dtcg');
    expect(result).toBe(false);
  });
});
