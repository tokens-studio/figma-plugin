import { TokenTypes } from '@/constants/TokenTypes';
import { mapTokensToStyleInfo } from '../mapTokensToStyleInfo';
import type { SingleToken } from '@/types/tokens';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';

describe('mapTokensToStyleInfo', () => {
  it('should create a map of the style IDs and the token info', () => {
    const colorToken: SingleToken = {
      type: TokenTypes.COLOR,
      name: 'colors.red',
      value: '#ff0000',
    };

    const result = mapTokensToStyleInfo(
      {
        global: [
          colorToken,
          {
            type: TokenTypes.COLOR,
            name: 'colors.blue',
            value: '#00ff00',
          },
        ],
      },
      { 'colors.red': 'S:1234' },
      (name) => convertTokenNameToPath(name, 'light', 0),
    );

    expect(result).toEqual({
      'colors.red': {
        styleId: 'S:1234',
        token: colorToken,
      },
    });
  });

  it('should still support the beta figmaStyleRefs structure', () => {
    const colorToken: SingleToken = {
      type: TokenTypes.COLOR,
      name: 'colors.red',
      value: '#ff0000',
    };

    const result = mapTokensToStyleInfo(
      { global: [colorToken] },
      { 'light/colors/red': 'S:1234' },
      (name) => convertTokenNameToPath(name, 'light', 0),
    );

    expect(result).toEqual({
      'colors.red': {
        styleId: 'S:1234',
        token: colorToken,
      },
    });
  });
});
