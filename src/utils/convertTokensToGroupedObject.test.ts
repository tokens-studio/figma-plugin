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

  it('should not resolve references', () => {
    const resolvedTokens = [
      {
        value: '#1B1F24',
        type: 'color',
        name: 'colors.gray.900',
        internal__Parent: 'base/options',
        rawValue: '#1B1F24',
      },
      {
        value: '#1B1F24',
        type: 'color',
        name: 'colors.gray.alias',
        internal__Parent: 'base/options',
        rawValue: '{colors.gray.900}',
      },
      {
        value: { width: 4, color: '#1B1F24', style: 'solid' },
        description: 'Font value',
        type: 'border',
        name: 'border.base',
        internal__Parent: 'core/border',
        rawValue: {
          width: '{sizing.base}',
          color: '{colors.gray.900}',
          style: 'solid',
        },
      },
    ] as ResolveTokenValuesResult[];
    const options = {
      expandTypography: false,
      expandShadow: false,
      expandComposition: false,
      expandBorder: false,
      preserveRawValue: true,
      throwErrorWhenNotResolved: false,
      resolveReferences: false,
    };
    expect(convertTokensToGroupedObject(resolvedTokens, [], options)).toEqual({
      border: {
        base: {
          description: 'Font value',
          rawValue: {
            color: '{colors.gray.900}',
            style: 'solid',
            width: '{sizing.base}',
          },
          type: 'border',
          value: {
            color: '{colors.gray.900}',
            style: 'solid',
            width: '{sizing.base}',
          },
        },
      },
      colors: {
        gray: {
          900: {
            rawValue: '#1B1F24',
            type: 'color',
            value: '#1B1F24',
          },
          alias: {
            rawValue: '{colors.gray.900}',
            type: 'color',
            value: '{colors.gray.900}',
          },
        },
      },
    });
  });
});
