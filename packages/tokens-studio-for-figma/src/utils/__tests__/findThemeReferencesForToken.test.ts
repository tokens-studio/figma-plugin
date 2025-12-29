import { findThemeReferencesForToken } from '../findThemeReferencesForToken';
import { ThemeObject } from '@/types/ThemeObject';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

describe('findThemeReferencesForToken', () => {
  const mockThemes: ThemeObject[] = [
    {
      id: 'theme1',
      name: 'Light Theme',
      selectedTokenSets: { global: TokenSetStatus.ENABLED },
      $figmaVariableReferences: {
        'colors.primary.500': 'var-123',
        'colors.secondary.100': 'var-456',
      },
    },
    {
      id: 'theme2',
      name: 'Dark Theme',
      selectedTokenSets: { global: TokenSetStatus.ENABLED },
      $figmaVariableReferences: {
        'colors.primary.500': 'var-789',
        'colors.accent.200': 'var-101',
      },
    },
    {
      id: 'theme3',
      name: 'Theme without references',
      selectedTokenSets: { global: TokenSetStatus.ENABLED },
    },
    {
      id: 'theme4',
      name: 'Theme with empty references',
      selectedTokenSets: { global: TokenSetStatus.ENABLED },
      $figmaVariableReferences: {},
    },
  ];

  it('should find themes that reference a specific token', () => {
    const result = findThemeReferencesForToken('colors.primary.500', mockThemes);

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        themeId: 'theme1',
        themeName: 'Light Theme',
        variableId: 'var-123',
      },
      {
        themeId: 'theme2',
        themeName: 'Dark Theme',
        variableId: 'var-789',
      },
    ]);
  });

  it('should return empty array when no themes reference the token', () => {
    const result = findThemeReferencesForToken('colors.nonexistent.token', mockThemes);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should return empty array when themes array is empty', () => {
    const result = findThemeReferencesForToken('colors.primary.500', []);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should handle themes without $figmaVariableReferences', () => {
    const result = findThemeReferencesForToken('colors.primary.500', [mockThemes[2]]);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should find single theme reference', () => {
    const result = findThemeReferencesForToken('colors.secondary.100', mockThemes);

    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        themeId: 'theme1',
        themeName: 'Light Theme',
        variableId: 'var-456',
      },
    ]);
  });
});
