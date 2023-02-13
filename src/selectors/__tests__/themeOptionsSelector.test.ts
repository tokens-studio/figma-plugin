import type { ThemeObject } from '@/types';
import type { RootState } from '@/app/store';
import { themeOptionsSelector } from '../themeOptionsSelector';

describe('themeOptionsSelector', () => {
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

    expect(themeOptionsSelector(mockState)).toEqual([
      {
        value: 'light',
        label: 'Light',
      },
      {
        value: 'dark',
        label: 'Dark',
      },
      {
        value: 'background',
        label: 'Background',
      },
    ]);
  });
});
