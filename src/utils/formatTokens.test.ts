import formatTokens from './formatTokens';

describe('formatTokens', () => {
  it('converts given tokens to an array', () => {
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
          type: 'typography',
        },
        {
          name: 'typography.heading.h2',
          value: {
            fontFamily: 'Inter',
            fontWeight: 'Regular',
            fontSize: 24,
          },
          description: 'Use for headings',
          type: 'typography',
        },
      ],
    };

    expect(formatTokens({
      tokens: typographyTokens, tokenSets: ['global'], expandTypography: true, expandShadow: false,
    })).toEqual(
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
                  fontFamily: {
                    value: 'Inter',
                    type: 'fontFamily',
                  },
                  fontWeight: {
                    value: 'Bold',
                    type: 'fontWeight',
                  },
                  fontSize: {
                    value: 36,
                    type: 'fontSize',
                  },
                },
                h2: {
                  fontFamily: {
                    value: 'Inter',
                    type: 'fontFamily',
                  },
                  fontWeight: {
                    value: 'Regular',
                    type: 'fontWeight',
                  },
                  fontSize: {
                    value: 24,
                    type: 'fontSize',
                  },
                },
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
