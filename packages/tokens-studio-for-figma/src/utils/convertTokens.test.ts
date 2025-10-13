import { TokenFormatOptions, setFormat } from '@/plugin/TokenFormatStoreClass';
import convertToTokenArray from './convertTokens';

describe('convertToTokenArray', () => {
  beforeEach(() => {
    setFormat(TokenFormatOptions.DTCG);
  });
  it('converts given tokens to an array', () => {
    const typographyTokens = {
      withValue: {
        input: {
          $value: {
            fontFamily: 'Inter',
            fontWeight: 'Regular',
            fontSize: 24,
          },
          $type: 'typography',
          $description: 'Use for headings',
        },
        output: {
          value: {
            fontFamily: 'Inter',
            fontWeight: 'Regular',
            fontSize: 24,
          },
          type: 'typography',
          description: 'Use for headings',
        },
      },
    };
    const compositionTokens = {
      input: {
        $value: {
          sizing: '{global.groupWithType.small}',
          opacity: '{global.opacity.50}',
        },
        $type: 'composition',
      },
      output: {
        value: {
          sizing: '{global.groupWithType.small}',
          opacity: '{global.opacity.50}',
        },
        type: 'composition',
      },
    };
    const basicTokens = {
      global: {
        withValue: {
          $value: 'bar',
          $type: 'other',
        },
        basic: '#ff0000',
        typography: {
          heading: {
            h2: typographyTokens.withValue.input,
          },
        },
        opacity: {
          50: {
            $type: 'opacity',
            $value: '50%',
          },
        },
        composition: {
          heading: compositionTokens.input,
        },
        groupWithType: {
          $type: 'sizing',
          small: {
            $value: '12px',
          },
          big: {
            $value: '24px',
            $type: 'dimension',
          },
        },
        nestGroupWithType: {
          $type: 'sizing',
          font: {
            small: {
              $value: '12px',
            },
            big: {
              $value: '24px',
              $type: 'dimension',
            },
          },
        },
      },
    };

    expect(convertToTokenArray({ tokens: basicTokens })).toEqual([
      { name: 'global.withValue', value: 'bar', type: 'other' },
      { name: 'global.basic', value: '#ff0000', type: 'other' },
      { ...typographyTokens.withValue.output, name: 'global.typography.heading.h2' },
      { name: 'global.opacity.50', value: '50%', type: 'opacity' },
      { ...compositionTokens.output, name: 'global.composition.heading' },
      {
        name: 'global.groupWithType.small',
        value: '12px',
        type: 'sizing',
        inheritTypeLevel: 3,
      },
      { name: 'global.groupWithType.big', value: '24px', type: 'dimension' },
      {
        name: 'global.nestGroupWithType.font.small',
        value: '12px',
        type: 'sizing',
        inheritTypeLevel: 3,
      },
      { name: 'global.nestGroupWithType.font.big', value: '24px', type: 'dimension' },
    ]);
    expect(
      convertToTokenArray({
        tokens: basicTokens,
        expandTypography: true,
        expandShadow: true,
        expandComposition: true,
        expandBorder: true,
      }),
    ).toEqual([
      { name: 'global.withValue', value: 'bar', type: 'other' },
      { name: 'global.basic', value: '#ff0000', type: 'other' },
      { ...typographyTokens.withValue.output, name: 'global.typography.heading.h2' },
      { name: 'global.opacity.50', value: '50%', type: 'opacity' },
      { ...compositionTokens.output, name: 'global.composition.heading' },
      {
        name: 'global.groupWithType.small',
        value: '12px',
        type: 'sizing',
        inheritTypeLevel: 3,
      },
      { name: 'global.groupWithType.big', value: '24px', type: 'dimension' },
      {
        name: 'global.nestGroupWithType.font.small',
        value: '12px',
        type: 'sizing',
        inheritTypeLevel: 3,
      },
      { name: 'global.nestGroupWithType.font.big', value: '24px', type: 'dimension' },
    ]);
  });

  it('ignores group-level and root-level $description metadata', () => {
    const tokensWithGroupDescriptions = {
      $description: 'Root level description',
      primary: {
        $description: 'Primary brand colors',
        10: {
          $value: '#061724',
          $type: 'color',
          $description: 'Token level description',
        },
        20: {
          $value: '#0a2540',
          $type: 'color',
        },
      },
      secondary: {
        $description: 'Secondary colors',
        light: {
          $value: '#f0f0f0',
          $type: 'color',
        },
      },
    };

    const result = convertToTokenArray({ tokens: tokensWithGroupDescriptions });
    
    // Should only include actual tokens, not $description metadata
    expect(result).toEqual([
      {
        name: 'primary.10',
        value: '#061724',
        type: 'color',
        description: 'Token level description',
      },
      {
        name: 'primary.20',
        value: '#0a2540',
        type: 'color',
      },
      {
        name: 'secondary.light',
        value: '#f0f0f0',
        type: 'color',
      },
    ]);

    // Verify that $description is not treated as a token
    const hasDescriptionToken = result.some((token) => token.name.includes('$description') || token.name.includes('description'));
    expect(hasDescriptionToken).toBe(false);
  });
});
