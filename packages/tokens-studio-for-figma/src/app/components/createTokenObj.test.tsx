import { createTokensObject, transformName } from './createTokenObj';

const baseTokens = {
  input: [
    {
      id: '123', type: 'color', description: 'some color', name: 'global.colors.gray.500', value: '#ff0000',
    },
    {
      id: '123', type: 'color', description: 'some color', name: 'global.colors.gray.400', value: '#ff0000',
    },
    {
      id: '123',
      type: 'color',
      description: 'some color',
      name: 'theme.colors.interaction.background.default',
      value: '#ff0000',
    },
    {
      id: '123',
      type: 'color',
      description: 'some color',
      name: 'global.colors.gray.50',
      value: '#ff0000',
    },
    {
      id: '123', type: 'asset', description: 'some assets', name: 'global.assets.image', value: 'http://image.png',
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
  },
};

describe('createTokenObj', () => {
  it('creates a token object', () => {
    expect(createTokensObject(baseTokens.input)).toEqual(baseTokens.output);
  });

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
    ];
    tokenNames.forEach((tokenName) => {
      expect(transformName(tokenName.input)).toEqual(tokenName.output);
    });
  });
});
