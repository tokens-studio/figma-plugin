import { TokenTypes } from '@/constants/TokenTypes';

export const tokensForStories = {
  spacing: {
    scale: {
      name: 'spacing.scale',
      value: '2',
      type: 'spacing',
    },
    xs: {
      name: 'spacing.xs',
      value: '4',
      type: 'spacing',
    },
    sm: {
      name: 'spacing.sm',
      value: '{spacing.xs} * {spacing.scale}',
      type: 'spacing',
    },
    md: {
      name: 'spacing.md',
      value: '{spacing.sm} * {spacing.scale}',
      type: 'spacing',
    },
    lg: {
      name: 'spacing.lg',
      value: '{spacing.md} * {spacing.scale}',
      type: 'spacing',
    },
    xl: {
      name: 'spacing.xl',
      value: '{spacing.lg} * {spacing.scale}',
      type: 'spacing',
    },
  },
  colors: {
    theme: {
      bg: {
        default: {
          name: 'theme.bg.default',
          value: '{colors.red.500}',
          description: 'My default token',
          type: TokenTypes.COLOR,
        },
      },
    },
    color: {
      black: {
        name: 'color.black',
        type: TokenTypes.COLOR,
        value: '#ffffff',
      },
      white: {
        name: 'color.white',
        type: TokenTypes.COLOR,
        value: '#000000',
      },
      gray: {
        100: {
          name: 'color.gray.100',
          value: '#FAFBFC',
          type: 'color',
        },
        200: {
          name: 'color.gray.200',
          value: '#EAEEF2',
          type: 'color',
        },
        300: {
          name: 'color.gray.300',
          value: '#D4DAE0',
          type: 'color',
        },
        400: {
          name: 'color.gray.400',
          value: '#B7BFC7',
          type: 'color',
        },
        500: {
          name: 'color.gray.500',
          value: '#949DA7',
          type: 'color',
        },
        600: {
          name: 'color.gray.600',
          value: '#707A84',
          type: 'color',
        },
        700: {
          name: 'color.gray.700',
          value: '#57606A',
          type: 'color',
        },
        800: {
          name: 'color.gray.800',
          value: '#424A53',
          type: 'color',
        },
        900: {
          name: 'color.gray.900',
          value: '#1B1F24',
          type: 'color',
        },
      },
      theme: {
        bg: {
          default: {
            name: 'theme.bg.default',
            value: '{colors.gray.100}',
            description: 'My default token',
            type: TokenTypes.COLOR,
          },
        },
        a: {
          deep: {
            nested: {
              token: {
                name: 'theme.bg.default',
                value: '#ffffff',
                description: 'My default token',
                type: TokenTypes.COLOR,
              },
            },
          },
        },
      },
      broken: {
        name: 'color.broken',
        value: '{color.notfound}',
        type: 'color',
      },
    },
  },
};
