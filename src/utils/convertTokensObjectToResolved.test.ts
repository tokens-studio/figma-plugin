import convertTokensObjectToResolved from './convertTokensObjectToResolved';

describe('convertTokensObjectToResolved', () => {
  it('throws error when token is not resolved', () => {
    const tokens = {
      global: {
        colors: {
          white: {
            value: '#ffffff',
            type: 'color',
          },
        },
      },
      dark: {
        colors: {
          background: {
            value: '$colors.black',
            type: 'color',
          },
        },
      },
    };

    expect(() => convertTokensObjectToResolved(tokens, [], [], { throwErrorWhenNotResolved: true })).toThrowError('ERROR: failed to resolve token "colors.background"');
  });
});
