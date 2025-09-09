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

  it('removes legacy id fields from studio.tokens extensions', () => {
    const tokensWithIds = {
      global: {
        primary: {
          $value: '#ff0000',
          $type: 'color',
          $extensions: {
            'studio.tokens': {
              id: 'abc-123-def-456',
              modify: { type: 'lighten', value: 0.1 },
            },
          },
        },
        secondary: {
          $value: '#00ff00',
          $type: 'color',
          $extensions: {
            'studio.tokens': {
              id: 'def-456-ghi-789',
            },
            'other.extension': {
              someData: 'value',
            },
          },
        },
        tertiary: {
          $value: '#0000ff',
          $type: 'color',
          $extensions: {
            'studio.tokens': {
              modify: { type: 'darken', value: 0.2 },
            },
          },
        },
      },
    };

    const result = convertToTokenArray({ tokens: tokensWithIds });

    expect(result).toEqual([
      {
        name: 'global.primary',
        value: '#ff0000',
        type: 'color',
        $extensions: {
          'studio.tokens': {
            modify: { type: 'lighten', value: 0.1 },
          },
        },
      },
      {
        name: 'global.secondary',
        value: '#00ff00',
        type: 'color',
        $extensions: {
          'other.extension': {
            someData: 'value',
          },
        },
      },
      {
        name: 'global.tertiary',
        value: '#0000ff',
        type: 'color',
        $extensions: {
          'studio.tokens': {
            modify: { type: 'darken', value: 0.2 },
          },
        },
      },
    ]);
  });
});
