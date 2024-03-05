import type { TokenState } from '../../tokenState';
import { disconnectStyleFromTheme } from '../tokenState/disconnectStyleFromTheme';

describe('disconnectStyleFromTheme', () => {
  it('should work', () => {
    const mockState = {
      themes: [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
          $figmaStyleReferences: {
            'colors.brand.primary': 'S:1234',
          },
        },
      ],
    } as unknown as TokenState;

    expect(disconnectStyleFromTheme(mockState, {
      id: 'light',
      key: 'colors.brand.primary',
    }).themes).toEqual([
      {
        id: 'light',
        name: 'Light',
        selectedTokenSets: {},
        $figmaStyleReferences: {},
      },
    ]);
  });

  it('should not do anything if the style does not exist', () => {
    const mockState = {
      themes: [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
          $figmaStyleReferences: {
            'colors.brand.primary': 'S:1234',
          },
        },
      ],
    } as unknown as TokenState;

    expect(disconnectStyleFromTheme(mockState, {
      id: 'light',
      key: 'colors.brand.secondary',
    }).themes).toEqual([
      {
        id: 'light',
        name: 'Light',
        selectedTokenSets: {},
        $figmaStyleReferences: {
          'colors.brand.primary': 'S:1234',
        },
      },
    ]);
  });
});
