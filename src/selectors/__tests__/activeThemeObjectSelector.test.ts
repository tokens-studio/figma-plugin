import { RootState } from '@/app/store';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { activeThemeObjectSelector } from '../activeThemeObjectSelector';

describe('activeThemeObjectSelector', () => {
  it('should return activeTheme', () => {
    const mockState = {
      tokenState: {
        themes: [
          {
            id: 'light',
            name: 'Light',
            selectedTokenSets: {},
            $figmaStyleReferences: {},
          },
          {
            id: 'dark',
            name: 'Dark',
            selectedTokenSets: {
              global: TokenSetStatus.ENABLED,
            },
            $figmaStyleReferences: {},
          },
        ],
        activeTheme: 'dark',
      },
    };
    expect(activeThemeObjectSelector(mockState as unknown as RootState)).toEqual({
      id: 'dark',
      name: 'Dark',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
      },
      $figmaStyleReferences: {},
    });
  });

  it('should return null when there is no activeTheme', () => {
    const mockState = {
      tokenState: {
        themes: [
          {
            id: 'light',
            name: 'Light',
            selectedTokenSets: {},
            $figmaStyleReferences: {},
          },
          {
            id: 'dark',
            name: 'Dark',
            selectedTokenSets: {
              global: TokenSetStatus.ENABLED,
            },
            $figmaStyleReferences: {},
          },
        ],
        activeTheme: null,
      },
    };
    expect(activeThemeObjectSelector(mockState as unknown as RootState)).toEqual(null);
  });
});
