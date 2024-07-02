import type { ThemeObject } from '@/types';
import type { RootState } from '@/app/store';
import { themeObjectsSelector } from '../themeObjectsSelector';

describe('themeObjectsSelector', () => {
  it('should work', () => {
    const lightTheme: ThemeObject = {
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaStyleReferences: {},
    };

    const darkTheme: ThemeObject = {
      id: 'dark',
      name: 'Dark',
      selectedTokenSets: {},
      $figmaStyleReferences: {},
    };

    const backgroundTheme: ThemeObject = {
      id: 'background',
      name: 'Background',
      selectedTokenSets: {},
      $figmaStyleReferences: {},
    };

    const mockState = {
      tokenState: { themes: [lightTheme, darkTheme, backgroundTheme] },
    } as unknown as RootState;

    expect(themeObjectsSelector(mockState)).toEqual([lightTheme, darkTheme, backgroundTheme]);
  });
});
