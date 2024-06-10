import type { TokenState } from '../../tokenState';
import { assignStyleIdsToTheme } from '../tokenState/assignStyleIdsToTheme';

describe('assignStyleIdsToTheme', () => {
  it('should work', () => {
    const mockState = {
      themes: [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
          $figmaStyleReferences: {},
        },
      ],
    } as unknown as TokenState;

    expect(assignStyleIdsToTheme(mockState, {
      id: 'light',
      styleIds: {
        'colors.brand.primary': 'S:1234',
      },
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

  it('keeps previously stored styleIds intact', () => {
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

    expect(assignStyleIdsToTheme(mockState, {
      id: 'light',
      styleIds: {
        'colors.brand.secondary': 'S:2345',
      },
    }).themes).toEqual([
      {
        id: 'light',
        name: 'Light',
        selectedTokenSets: {},
        $figmaStyleReferences: {
          'colors.brand.primary': 'S:1234',
          'colors.brand.secondary': 'S:2345',
        },
      },
    ]);
  });

  it('overwrites existing styleids', () => {
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

    expect(assignStyleIdsToTheme(mockState, {
      id: 'light',
      styleIds: {
        'colors.brand.primary': 'S:9999',
        'colors.brand.secondary': 'S:2345',
      },
    }).themes).toEqual([
      {
        id: 'light',
        name: 'Light',
        selectedTokenSets: {},
        $figmaStyleReferences: {
          'colors.brand.primary': 'S:9999',
          'colors.brand.secondary': 'S:2345',
        },
      },
    ]);
  });
});
