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
        },
        basic: '#ff0000',
        typography: {
          heading: {
            h2: typographyTokens.withValue.input,
          },
        },
      },
    };

    expect(convertToTokenArray({ tokens: basicTokens })).toEqual([
      { name: 'global.withValue', value: 'bar' },
      { name: 'global.basic', value: '#ff0000' },
      { ...typographyTokens.withValue.output, name: 'global.typography.heading.h2' },
    ]);
  });
});
