import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import formatTokens from './formatTokens';
import { TokenFormatOptions, setFormat } from '@/plugin/TokenFormatStoreClass';

describe('formatTokens', () => {
  beforeEach(() => {
    setFormat(TokenFormatOptions.DTCG);
  });

  const resolvedTokens = [
    {
      name: 'typography.heading.alias',
      type: TokenTypes.TYPOGRAPHY,
      value: {
        fontFamily: 'Inter',
        fontWeight: 'Bold',
        fontSize: 36,
      },
      description: 'Use for headings',
    },
    {
      name: 'typography.heading.non_resolved',
      value: '{typography.heading.new}',
      type: TokenTypes.TYPOGRAPHY,
      description: 'Use for headings',
    },
    {
      type: TokenTypes.BOX_SHADOW,
      name: 'shadows.alias',
      value: [
        {
          type: 'dropShadow',
          color: 'rgba({colors.red.500}, 0.5)',
          x: 0,
          y: 0,
          blur: 2,
          spread: 4,
        },
      ],
    },
  ];
  const typographyTokens = {
    global: [
      { name: 'withValue', value: 'bar' },
      { name: 'basic', value: '#ff0000' },
      {
        name: 'typography.heading.h1',
        value: {
          fontFamily: 'Inter',
          fontWeight: 'Bold',
          fontSize: 36,
        },
        description: 'Use for bold headings',
        type: TokenTypes.TYPOGRAPHY,
      },
      {
        name: 'typography.heading.h2',
        value: {
          fontFamily: 'Inter',
          fontWeight: 'Regular',
          fontSize: 24,
        },
        description: 'Use for headings',
        type: TokenTypes.TYPOGRAPHY,
      },
      {
        name: 'typography.heading.alias',
        value: '{typography.heading.h1}',
        description: 'Use for headings',
        type: TokenTypes.TYPOGRAPHY,
      },
      {
        name: 'typography.heading.non_resolved',
        value: '{typography.heading.new}',
        type: TokenTypes.TYPOGRAPHY,
        description: 'Use for headings',
      },
      {
        name: 'typography.heading.no_matching',
        type: TokenTypes.TYPOGRAPHY,
        value: '{typography.heading.no_matching}',
      },
      {
        type: TokenTypes.BOX_SHADOW,
        name: 'shadows.md',
        value: [
          {
            type: 'dropShadow',
            color: 'rgba({colors.red.500}, 0.5)',
            x: 0,
            y: 0,
            blur: 2,
            spread: 4,
          },
        ],
      },
      {
        type: TokenTypes.BOX_SHADOW,
        name: 'shadows.alias',
        value: '{shadows.md}',
      },
    ],
  } as unknown as Record<string, AnyTokenList>;

  it('converts given tokens to an array', () => {
    expect(
      formatTokens({
        tokens: typographyTokens,
        tokenSets: ['global'],
        resolvedTokens: resolvedTokens as AnyTokenList,
        expandTypography: true,
        expandShadow: false,
      }),
    ).toEqual(
      JSON.stringify(
        {
          global: {
            withValue: {
              $value: 'bar',
            },
            basic: {
              $value: '#ff0000',
            },
            typography: {
              heading: {
                h1: {
                  fontFamily: {
                    $value: 'Inter',
                    $type: 'fontFamilies',
                  },
                  fontWeight: {
                    $value: 'Bold',
                    $type: 'fontWeights',
                  },
                  fontSize: {
                    $value: 36,
                    $type: 'fontSizes',
                  },
                },
                h2: {
                  fontFamily: {
                    $value: 'Inter',
                    $type: 'fontFamilies',
                  },
                  fontWeight: {
                    $value: 'Regular',
                    $type: 'fontWeights',
                  },
                  fontSize: {
                    $value: 24,
                    $type: 'fontSizes',
                  },
                },
                alias: {
                  $value: '{typography.heading.h1}',
                  $type: 'typography',
                  $description: 'Use for headings',
                },
                non_resolved: {
                  $value: '{typography.heading.new}',
                  $type: TokenTypes.TYPOGRAPHY,
                  $description: 'Use for headings',
                },
                no_matching: {
                  $value: '{typography.heading.no_matching}',
                  $type: TokenTypes.TYPOGRAPHY,
                },
              },
            },
            shadows: {
              md: {
                $value: [
                  {
                    type: 'dropShadow',
                    color: 'rgba({colors.red.500}, 0.5)',
                    x: 0,
                    y: 0,
                    blur: 2,
                    spread: 4,
                  },
                ],
                $type: TokenTypes.BOX_SHADOW,
              },
              alias: {
                $value: '{shadows.md}',
                $type: TokenTypes.BOX_SHADOW,
              },
            },
          },
        },
        null,
        2,
      ),
    );
  });

  it('converts given tokens to an array without expanding', () => {
    expect(
      formatTokens({
        tokens: typographyTokens,
        tokenSets: ['global'],
        resolvedTokens: resolvedTokens as AnyTokenList,
        expandTypography: false,
        expandShadow: true,
      }),
    ).toEqual(
      JSON.stringify(
        {
          global: {
            withValue: {
              $value: 'bar',
            },
            basic: {
              $value: '#ff0000',
            },
            typography: {
              heading: {
                h1: {
                  $value: {
                    fontFamily: 'Inter',
                    fontWeight: 'Bold',
                    fontSize: 36,
                  },
                  $type: 'typography',
                  $description: 'Use for bold headings',
                },
                h2: {
                  $value: {
                    fontFamily: 'Inter',
                    fontWeight: 'Regular',
                    fontSize: 24,
                  },
                  $type: 'typography',
                  $description: 'Use for headings',
                },
                alias: {
                  $value: '{typography.heading.h1}',
                  $type: 'typography',
                  $description: 'Use for headings',
                },
                non_resolved: {
                  $value: '{typography.heading.new}',
                  $type: TokenTypes.TYPOGRAPHY,
                  $description: 'Use for headings',
                },
                no_matching: {
                  $value: '{typography.heading.no_matching}',
                  $type: TokenTypes.TYPOGRAPHY,
                },
              },
            },
            shadows: {
              md: {
                0: {
                  type: {
                    $value: 'dropShadow',
                    $type: 'type',
                  },
                  color: {
                    $value: 'rgba({colors.red.500}, 0.5)',
                    $type: 'color',
                  },
                  x: {
                    $value: 0,
                    $type: 'x',
                  },
                  y: {
                    $value: 0,
                    $type: 'y',
                  },
                  blur: {
                    $value: 2,
                    $type: 'blur',
                  },
                  spread: {
                    $value: 4,
                    $type: 'spread',
                  },
                },
              },
              alias: {
                $value: '{shadows.md}',
                $type: TokenTypes.BOX_SHADOW,
              },
            },
          },
        },
        null,
        2,
      ),
    );
  });

  it('respects the global token format setting', () => {
    setFormat(TokenFormatOptions.Legacy);
    expect(
      formatTokens({
        tokens: typographyTokens,
        tokenSets: ['global'],
        resolvedTokens: resolvedTokens as AnyTokenList,
      }),
    ).toEqual(
      JSON.stringify(
        {
          global: {
            withValue: {
              value: 'bar',
            },
            basic: {
              value: '#ff0000',
            },
            typography: {
              heading: {
                h1: {
                  value: {
                    fontFamily: 'Inter',
                    fontWeight: 'Bold',
                    fontSize: 36,
                  },
                  type: 'typography',
                  description: 'Use for bold headings',
                },
                h2: {
                  value: {
                    fontFamily: 'Inter',
                    fontWeight: 'Regular',
                    fontSize: 24,
                  },
                  type: 'typography',
                  description: 'Use for headings',
                },
                alias: {
                  value: '{typography.heading.h1}',
                  type: 'typography',
                  description: 'Use for headings',
                },
                non_resolved: {
                  value: '{typography.heading.new}',
                  type: TokenTypes.TYPOGRAPHY,
                  description: 'Use for headings',
                },
                no_matching: {
                  value: '{typography.heading.no_matching}',
                  type: TokenTypes.TYPOGRAPHY,
                },
              },
            },
            shadows: {
              md: {
                value: [
                  {
                    type: 'dropShadow',
                    color: 'rgba({colors.red.500}, 0.5)',
                    x: 0,
                    y: 0,
                    blur: 2,
                    spread: 4,
                  },
                ],
                type: TokenTypes.BOX_SHADOW,
              },
              alias: {
                value: '{shadows.md}',
                type: TokenTypes.BOX_SHADOW,
              },
            },
          },
        },
        null,
        2,
      ),
    );
  });
});
