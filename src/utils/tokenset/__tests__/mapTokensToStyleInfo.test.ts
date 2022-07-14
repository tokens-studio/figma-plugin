import { TokenTypes } from '@/constants/TokenTypes';
import { mapTokensToStyleInfo } from '../mapTokensToStyleInfo';
import type { SingleToken } from '@/types/tokens';

describe('mapTokensToStyleInfo', () => {
  it('should create a map of the style IDs and the token info', () => {
    const colorToken: SingleToken = {
      type: TokenTypes.COLOR,
      name: 'colors.red',
      value: '#ff0000',
    };

    const result = mapTokensToStyleInfo({
      global: [colorToken],
    }, {
      'colors.red': 'S:1234',
    });

    expect(result).toEqual({
      'colors.red': {
        styleId: 'S:1234',
        token: colorToken,
      },
    });
  });
});
