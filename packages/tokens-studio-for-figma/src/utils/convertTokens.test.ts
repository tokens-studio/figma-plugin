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
      { value: 'bar', name: 'global.withValue.$value' },
      { value: 'other', name: 'global.withValue.$type' },
      { value: '#ff0000', name: 'global.basic' },
      {
        value: 'Inter',
        name: 'global.typography.heading.h2.$value.fontFamily'
      },
      {
        value: 'Regular',
        name: 'global.typography.heading.h2.$value.fontWeight'
      },
      { value: 24, name: 'global.typography.heading.h2.$value.fontSize' },
      { value: 'typography', name: 'global.typography.heading.h2.$type' },
      {
        value: 'Use for headings',
        name: 'global.typography.heading.h2.$description'
      },
      { value: 'opacity', name: 'global.opacity.50.$type' },
      { value: '50%', name: 'global.opacity.50.$value' },
      {
        value: '{global.groupWithType.small}',
        name: 'global.composition.heading.$value.sizing'
      },
      {
        value: '{global.opacity.50}',
        name: 'global.composition.heading.$value.opacity'
      },
      { value: 'composition', name: 'global.composition.heading.$type' },
      { value: 'sizing', name: 'global.groupWithType.$type' },
      { value: '12px', name: 'global.groupWithType.small.$value' },
      { value: '24px', name: 'global.groupWithType.big.$value' },
      { value: 'dimension', name: 'global.groupWithType.big.$type' },
      { value: 'sizing', name: 'global.nestGroupWithType.$type' },
      { value: '12px', name: 'global.nestGroupWithType.font.small.$value' },
      { value: '24px', name: 'global.nestGroupWithType.font.big.$value' },
      {
        value: 'dimension',
        name: 'global.nestGroupWithType.font.big.$type'
      }
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
      { value: 'bar', name: 'global.withValue.$value' },
      { value: 'other', name: 'global.withValue.$type' },
      { value: '#ff0000', name: 'global.basic' },
      {
        value: 'Inter',
        name: 'global.typography.heading.h2.$value.fontFamily'
      },
      {
        value: 'Regular',
        name: 'global.typography.heading.h2.$value.fontWeight'
      },
      { value: 24, name: 'global.typography.heading.h2.$value.fontSize' },
      { value: 'typography', name: 'global.typography.heading.h2.$type' },
      {
        value: 'Use for headings',
        name: 'global.typography.heading.h2.$description'
      },
      { value: 'opacity', name: 'global.opacity.50.$type' },
      { value: '50%', name: 'global.opacity.50.$value' },
      {
        value: '{global.groupWithType.small}',
        name: 'global.composition.heading.$value.sizing'
      },
      {
        value: '{global.opacity.50}',
        name: 'global.composition.heading.$value.opacity'
      },
      { value: 'composition', name: 'global.composition.heading.$type' },
      { value: 'sizing', name: 'global.groupWithType.$type' },
      { value: '12px', name: 'global.groupWithType.small.$value' },
      { value: '24px', name: 'global.groupWithType.big.$value' },
      { value: 'dimension', name: 'global.groupWithType.big.$type' },
      { value: 'sizing', name: 'global.nestGroupWithType.$type' },
      { value: '12px', name: 'global.nestGroupWithType.font.small.$value' },
      { value: '24px', name: 'global.nestGroupWithType.font.big.$value' },
      {
        value: 'dimension',
        name: 'global.nestGroupWithType.font.big.$type'
      }
    ]);
  });
});
