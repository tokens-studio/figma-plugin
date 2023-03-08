import { TokenTypes } from '@/constants/TokenTypes';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import convertTokensToGroupedObject from './convertTokensToGroupedObject';

describe('convertTokensToGroupedObject', () => {
  it('should resolve extension', () => {
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
      resolveReferences: false,
    };
    expect(convertTokensToGroupedObject(resolvedTokens, [], options)).toEqual({
      color: {
        first: {
          type: 'color',
          value: '#ffffff',
        },
        modify: {
          $extensions: {
            'studio.tokens': {
              modify: {
                space: 'lch',
                type: 'darken',
                value: '0.4',
              },
            },
          },
          type: 'color',
          value: '#ffffff',
        },
      },
    });
  });

  it('should not resolve extension', () => {
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
    expect(convertTokensToGroupedObject(resolvedTokens, [], options)).toEqual({
      color: {
        first: {
          type: 'color',
          value: '#ffffff',
        },
        modify: {
          type: 'color',
          value: '#ffffff',
        },
      },
    });
  });
});
