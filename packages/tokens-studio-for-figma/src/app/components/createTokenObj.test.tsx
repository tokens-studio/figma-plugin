import { TokenTypes } from '@/constants/TokenTypes';
import { createTokensObject, transformName, appendTypeToToken } from './createTokenObj';

const baseTokens = {
  input: [
    {
      id: '123', type: TokenTypes.COLOR, description: 'some color', name: 'global.colors.gray.500', value: '#ff0000',
    },
    {
      id: '123', type: TokenTypes.COLOR, description: 'some color', name: 'global.colors.gray.400', value: '#ff0000',
    },
    {
      id: '123',
      type: TokenTypes.COLOR,
      description: 'some color',
      name: 'theme.colors.interaction.background.default',
      value: '#ff0000',
    },
    {
      id: '123',
      type: TokenTypes.COLOR,
      description: 'some color',
      name: 'global.colors.gray.50',
      value: '#ff0000',
    },
    {
      id: '123', type: TokenTypes.ASSET, description: 'some assets', name: 'global.assets.image', value: 'http://image.png',
    },
    {
      id: '123', type: TokenTypes.OTHER, description: 'some other components', name: 'components.button', value: '{composition.action.button}',
    },
  ],
  output: {
    asset: {
      values: {
        global: {
          assets: {
            image: {
              id: '123',
              type: 'asset',
              description: 'some assets',
              name: 'global.assets.image',
              value: 'http://image.png',
            },
          },
        },
      },
    },
    color: {
      values: {
        global: {
          colors: {
            gray: {
              50: {
                id: '123',
                type: 'color',
                description: 'some color',
                name: 'global.colors.gray.50',
                value: '#ff0000',
              },
              400: {
                id: '123',
                type: 'color',
                description: 'some color',
                name: 'global.colors.gray.400',
                value: '#ff0000',
              },
              500: {
                id: '123',
                type: 'color',
                description: 'some color',
                name: 'global.colors.gray.500',
                value: '#ff0000',
              },
            },
          },
        },
        theme: {
          colors: {
            interaction: {
              background: {
                default: {
                  id: '123',
                  type: 'color',
                  description: 'some color',
                  name: 'theme.colors.interaction.background.default',
                  value: '#ff0000',
                },
              },
            },
          },
        },
      },
    },
    other: {
      values: {
        components: {
          button: {
            description: 'some other components',
            id: '123',
            name: 'components.button',
            type: 'other',
            value: '{composition.action.button}',
          },
        },
      },
    },
  },
};

describe('createTokenObj', () => {
  it('creates a token object', () => expect(createTokensObject(baseTokens.input)).toEqual(baseTokens.output));

  it('should transform name', () => {
    const tokenNames = [
      {
        input: 'color',
        output: 'color',
      },
      {
        input: 'colors',
        output: 'color',
      },
      {
        input: 'space',
        output: 'spacing',
      },
      {
        input: 'spacing',
        output: 'spacing',
      },
      {
        input: 'size',
        output: 'sizing',
      },
      {
        input: 'sizing',
        output: 'sizing',
      },
      {
        input: 'boxShadow',
        output: 'boxShadow',
      },
      {
        input: 'borderRadius',
        output: 'borderRadius',
      },
      {
        input: 'borderWidth',
        output: 'borderWidth',
      },
      {
        input: 'opacity',
        output: 'opacity',
      },
      {
        input: 'fontFamilies',
        output: 'fontFamilies',
      },
      {
        input: 'fontWeights',
        output: 'fontWeights',
      },
      {
        input: 'fontSizes',
        output: 'fontSizes',
      },
      {
        input: 'lineHeights',
        output: 'lineHeights',
      },
      {
        input: 'typography',
        output: 'typography',
      },
      {
        input: 'letterSpacing',
        output: 'letterSpacing',
      },
      {
        input: 'paragraphSpacing',
        output: 'paragraphSpacing',
      },
      {
        input: 'composition',
        output: 'composition',
      },
      {
        input: 'border',
        output: 'border',
      },
      {
        input: 'asset',
        output: 'asset',
      },
      {
        input: 'button',
        output: 'other',
      },
    ];
    tokenNames.forEach((tokenName) => {
      expect(transformName(tokenName.input)).toEqual(tokenName.output);
    });
  });

  it('should append type to token', () => {
    const INPUT_TOKENS = [
      {
        id: '123',
        description: 'some description',
        name: 'global.colors.red',
        value: '#ff0000',
        type: TokenTypes.COLOR,
      },
      {
        id: '123',
        description: 'some description',
        name: 'global.spacing.small',
        value: '8px',
        type: TokenTypes.SPACING,
      },
      {
        id: '123',
        description: 'some description',
        name: 'global.fontSizes.medium',
        value: '16px',
        type: TokenTypes.FONT_SIZES,
      },
    ];

    const RESULT_TOKENS = [
      {
        id: '123',
        description: 'some description',
        name: 'global.colors.red',
        value: '#ff0000',
        type: 'color',
      },
      {
        id: '123',
        description: 'some description',
        name: 'global.spacing.small',
        value: '8px',
        type: 'spacing',
      },
      {
        id: '123',
        description: 'some description',
        name: 'global.fontSizes.medium',
        value: '16px',
        type: 'fontSizes',
      },
    ];

    const result = INPUT_TOKENS.map((token) => appendTypeToToken(token));
    expect(result).toEqual(RESULT_TOKENS);
  });
});
