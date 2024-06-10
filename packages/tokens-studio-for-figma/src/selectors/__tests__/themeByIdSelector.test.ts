import { themeByIdSelector } from '../themeByIdSelector';
import type { ThemeObject } from '@/types';
import type { RootState } from '@/app/store';

describe('themeByIdSelector', () => {
  it('should work', () => {
    const lightTheme: ThemeObject = {
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaStyleReferences: {},
    };

    const mockState = {
      tokenState: { themes: [lightTheme] },
    } as unknown as RootState;

    expect(themeByIdSelector(mockState, 'light')).toEqual(lightTheme);
  });
});
