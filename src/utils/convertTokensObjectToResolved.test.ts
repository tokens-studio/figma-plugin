import convertTokensObjectToResolved from './convertTokensObjectToResolved';

describe('convertTokensObjectToResolved', () => {
  it('converts object-like unresolved tokens to resolved object', () => {
    const tokens = {
      options: {
        colors: {
          red: {
            value: '#ff0000',
            type: 'color',
          },
          blue: {
            value: '#0000ff',
            type: 'color',
          },
        },
        sizing: {
          base: {
            value: '2',
            type: 'sizing',
          },
          scale: {
            value: '1.5',
            type: 'sizing',
          },
          small: {
            value: '1 * {sizing.base}',
            type: 'sizing',
          },
          medium: {
            value: '{sizing.small} * {sizing.scale}',
            type: 'sizing',
          },
        },
      },
      theme: {
        colors: {
          primary: {
            value: '$colors.red',
            type: 'color',
          },
        },
      },
    };

    expect(convertTokensObjectToResolved(tokens)).toMatchSnapshot();
  });

  it('respects used sets', () => {
    const tokens = {
      global: {
        colors: {
          white: {
            value: '#ffffff',
            type: 'color',
          },
          black: {
            value: '#000000',
            type: 'color',
          },
        },
      },
      light: {
        colors: {
          background: {
            value: '$colors.white',
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

    expect(convertTokensObjectToResolved(tokens, ['global', 'light'])).toMatchSnapshot();
  });

  it('does not expand typography when not needed', () => {
    const tokens = {
      options: [
        {
          name: 'typography.h1',
          type: 'typography',
          value: {
            fontFamily: 'Roboto',
            fontSize: '96',
            fontWeight: 'Light',
          },
        },
        {
          name: 'typography.h2',
          type: 'typography',
          value: {
            fontFamily: 'Roboto',
            fontSize: '60',
            fontWeight: 'Light',
          },
        },
        {
          name: 'typography.h3',
          type: 'typography',
          value: {
            fontFamily: 'Roboto',
            fontSize: '48',
            fontWeight: 'Light',
          },
        },
      ],
    };

    expect(convertTokensObjectToResolved(tokens, [], [], { expandTypography: false, expandShadow: false, preserveRawValue: false })).toMatchSnapshot();
  });

  it('preserves rawValue when requested', () => {
    const tokens = {
      global: {
        colors: {
          white: {
            value: '#ffffff',
            type: 'color',
          },
          black: {
            value: '#000000',
            type: 'color',
          },
        },
      },
      light: {
        colors: {
          background: {
            value: '$colors.white',
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

    expect(convertTokensObjectToResolved(tokens, [], [], { expandTypography: false, expandShadow: false, preserveRawValue: true })).toMatchSnapshot();
  });
});
