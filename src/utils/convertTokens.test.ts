import convertToTokenArray from './convertTokens';

describe('convertToTokenArray', () => {
  it('converts given tokens to an array', () => {
    const typographyTokens = {
      withValue: {
        input: {
          value: {
            fontFamily: 'Inter',
            fontWeight: 'Regular',
            fontSize: 24,
          },
          type: 'typography',
          description: 'Use for headings',
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
    const basicTokens = {
      global: {
        withValue: {
          value: 'bar',
          type: 'other',
        },
        basic: '#ff0000',
        typography: {
          heading: {
            h2: typographyTokens.withValue.input,
          },
        },
        groupWithType: {
          type: 'sizing',
          small: {
            value: '12px',
          },
          big: {
            value: '24px',
            type: 'dimension',
          },
        },
        nestGroupWithType: {
          type: 'sizing',
          font: {
            small: {
              value: '12px',
            },
            big: {
              value: '24px',
              type: 'dimension',
            },
          },
        },
      },
    };

    expect(convertToTokenArray({ tokens: basicTokens })).toEqual([
      { name: 'global.withValue', value: 'bar', type: 'other' },
      { name: 'global.basic', value: '#ff0000' },
      { ...typographyTokens.withValue.output, name: 'global.typography.heading.h2' },
      {
        name: 'global.groupWithType.small', value: '12px', type: 'sizing', inheritTypeLevel: 3,
      },
      { name: 'global.groupWithType.big', value: '24px', type: 'dimension' },
      {
        name: 'global.nestGroupWithType.font.small', value: '12px', type: 'sizing', inheritTypeLevel: 3,
      },
      { name: 'global.nestGroupWithType.font.big', value: '24px', type: 'dimension' },
    ]);

    expect(convertToTokenArray({
      tokens: basicTokens, expandTypography: true, expandShadow: true, expandComposition: true,
    })).toEqual([
      { name: 'global.withValue', value: 'bar', type: 'other' },
      { name: 'global.basic', value: '#ff0000' },
      { ...typographyTokens.withValue.output, name: 'global.typography.heading.h2' },
      {
        name: 'global.groupWithType.small', value: '12px', type: 'sizing', inheritTypeLevel: 3,
      },
      { name: 'global.groupWithType.big', value: '24px', type: 'dimension' },
      {
        name: 'global.nestGroupWithType.font.small', value: '12px', type: 'sizing', inheritTypeLevel: 3,
      },
      { name: 'global.nestGroupWithType.font.big', value: '24px', type: 'dimension' },
    ]);
  });
});
