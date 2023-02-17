import { TokenTypes } from '@/constants/TokenTypes';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import convertTokensToGroupedObject from './convertTokensToGroupedObject';

describe('convertTokensToGroupedObject', () => {
  it('convertTokensToGroupedObject', () => {
    const resolvedTokens = [
      {
        name: 'color.first',
        value: '#ffffff',
        type: TokenTypes.COLOR,
      },
      {
        name: 'color.modify',
        value: '#ffffff',
        $extensions: {
          'studio.tokens': {
            modify: {
              type: 'darken', value: '0.4', space: 'lch',
            },
          },
        },
        type: TokenTypes.COLOR,
      },

    ] as ResolveTokenValuesResult[];
    const options = {
      expandTypography: true,
      expandShadow: true,
      expandComposition: true,
      expandBorder: true,
      preserveRawValue: true,
      throwErrorWhenNotResolved: true,
      resolveReferences: true,
    };
    expect(convertTokensToGroupedObject(resolvedTokens, [], options)).toEqual();
  });
});
