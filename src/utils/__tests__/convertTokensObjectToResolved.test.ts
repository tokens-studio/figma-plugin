import convertTokensObjectToResolved from '../convertTokensObjectToResolved';

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

  it('does not expand shadows when not needed', () => {
    const tokens = {
      options: [
        {
          name: 'shadow.1',
          type: 'boxShadow',
          value: {
            x: '2',
            y: '3',
            blur: '4',
            spread: '5',
            color: '#000000',
            type: 'dropShadow',
          },
        },
        {
          name: 'shadow.2',
          type: 'boxShadow',
          value: [
            {
              x: '2',
              y: '3',
              blur: '4',
              spread: '5',
              color: '#000000',
              type: 'dropShadow',
            },
            {
              x: '3',
              y: '4',
              blur: '5',
              spread: '6',
              color: '#000000',
              type: 'dropShadow',
            },
          ],
        },
      ],
    };

    expect(convertTokensObjectToResolved(tokens, [], [], { expandTypography: false, expandShadow: false, preserveRawValue: true })).toMatchSnapshot();
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

  it('resolves all references when requested', () => {
    const tokens = {
      global: {
        colors: {
          blue: {
            type: 'color',
            value: '#0000ff',
          },
          primary: {
            description: 'Should be resolved',
            type: 'color',
            value: '$colors.red',
          },
          red: {
            type: 'color',
            value: '#ff0000',
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
          xsmall: {
            description: 'Should be resolved',
            value: '1 * {sizing.base}',
            type: 'sizing',
          },
          small: {
            description: 'Should be resolved',
            value: '{sizing.base}',
            type: 'sizing',
          },
          medium: {
            description: 'Should be resolved',
            value: '{sizing.small} * {sizing.scale}',
            type: 'sizing',
          },
          large: {
            description: 'Should be resolved',
            value: '$sizing.medium * $sizing.scale',
            type: 'sizing',
          },
        },
        text: {
          size: {
            base: {
              value: '16',
              type: 'fontSize',
            },
            h1: {
              value: '96',
              type: 'fontSize',
            },
            unit: {
              value: 'px',
              type: 'fontSize',
            },
            default: {
              description: 'Should be resolved',
              value: '{text.size.base}{text.size.unit}',
              type: 'fontSize',
            },
          },
          fontWeight: {
            base: {
              value: '100',
              type: 'fontWeight',
            },
            light: {
              value: 'Light',
              type: 'fontWeight',
            },
          },
          typography: [
            {
              description: 'Should be resolved',
              name: 'typography.h1',
              type: 'typography',
              value: {
                fontFamily: 'Roboto',
                fontSize: '{text.size.h1}',
                fontWeight: '{text.fontWeight.light}',
              },
            },
            {
              description: 'Should be resolved',
              name: 'typography.h2',
              type: 'typography',
              value: {
                fontFamily: 'Roboto',
                fontSize: '3.75 * {text.size.base}',
                fontWeight: '7 * {text.fontWeight.base}',
              },
            },
            {
              description: 'Should be resolved',
              name: 'typography.h3',
              type: 'typography',
              value: {
                fontFamily: 'Roboto',
                fontSize: '3 * {text.size.base}',
                fontWeight: '5 * 100',
              },
            },
          ],
        },
      },
    };

    expect(convertTokensObjectToResolved(tokens, [], [], {
      expandTypography: false, expandShadow: false, preserveRawValue: false, resolveReferences: true,
    })).toMatchSnapshot();
  });

  it('preserves all references when requested', () => {
    const tokens = {
      global: {
        colors: {
          blue: {
            type: 'color',
            value: '#0000ff',
          },
          primary: {
            description: 'Should NOT be resolved',
            type: 'color',
            value: '$colors.red',
          },
          red: {
            type: 'color',
            value: '#ff0000',
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
          xsmall: {
            description: 'Should NOT be resolved',
            value: '1 * {sizing.base}',
            type: 'sizing',
          },
          small: {
            description: 'Should NOT be resolved',
            value: '{sizing.base}',
            type: 'sizing',
          },
          medium: {
            description: 'Should NOT be resolved',
            value: '{sizing.small} * {sizing.scale}',
            type: 'sizing',
          },
          large: {
            description: 'Should NOT be resolved',
            value: '$sizing.medium * $sizing.scale',
            type: 'sizing',
          },
        },
        text: {
          size: {
            base: {
              value: '16',
              type: 'fontSize',
            },
            h1: {
              value: '96',
              type: 'fontSize',
            },
            unit: {
              value: 'px',
              type: 'fontSize',
            },
            default: {
              description: 'Should NOT be resolved',
              value: '{text.size.base}{text.size.unit}',
              type: 'fontSize',
            },
          },
          fontWeight: {
            base: {
              value: '100',
              type: 'fontWeight',
            },
            light: {
              value: 'Light',
              type: 'fontWeight',
            },
          },
          typography: [
            {
              description: 'Should NOT be resolved',
              name: 'typography.h1',
              type: 'typography',
              value: {
                fontFamily: 'Roboto',
                fontSize: '{text.size.h1}',
                fontWeight: '{text.fontWeight.light}',
              },
            },
            {
              description: 'Should NOT be resolved',
              name: 'typography.h2',
              type: 'typography',
              value: {
                fontFamily: 'Roboto',
                fontSize: '3.75 * {text.size.base}',
                fontWeight: '7 * {text.fontWeight.base}',
              },
            },
            {
              description: 'Should NOT be resolved',
              name: 'typography.h3',
              type: 'typography',
              value: {
                fontFamily: 'Roboto',
                fontSize: '3 * {text.size.base}',
                fontWeight: '5 * 100',
              },
            },
          ],
        },
      },
    };

    expect(convertTokensObjectToResolved(tokens, [], [], {
      expandTypography: false, expandShadow: false, preserveRawValue: false, resolveReferences: false,
    })).toMatchSnapshot();
  });

  it('resolves only math expressions when requested', () => {
    const tokens = {
      global: {
        colors: {
          blue: {
            type: 'color',
            value: '#0000ff',
          },
          primary: {
            description: 'Should NOT be resolved',
            type: 'color',
            value: '$colors.red',
          },
          red: {
            type: 'color',
            value: '#ff0000',
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
          xsmall: {
            description: 'Should be resolved',
            value: '1 * {sizing.base}',
            type: 'sizing',
          },
          small: {
            description: 'Should NOT be resolved',
            value: '{sizing.base}',
            type: 'sizing',
          },
          medium: {
            description: 'Should be resolved',
            value: '{sizing.small} * {sizing.scale}',
            type: 'sizing',
          },
          large: {
            description: 'Should be resolved',
            value: '$sizing.medium * $sizing.scale',
            type: 'sizing',
          },
        },
        text: {
          size: {
            base: {
              value: '16',
              type: 'fontSize',
            },
            h1: {
              value: '96',
              type: 'fontSize',
            },
            unit: {
              value: 'px',
              type: 'fontSize',
            },
            default: {
              description: 'Should NOT be resolved',
              value: '{text.size.base}{text.size.unit}',
              type: 'fontSize',
            },
          },
          fontWeight: {
            base: {
              value: '100',
              type: 'fontWeight',
            },
            light: {
              value: 'Light',
              type: 'fontWeight',
            },
          },
          typography: [
            {
              description: 'Should NOT be resolved',
              name: 'typography.h1',
              type: 'typography',
              value: {
                fontFamily: 'Roboto',
                fontSize: '{text.size.base}',
                fontWeight: '{text.fontWeight.light}',
              },
            },
            {
              description: 'Should be resolved',
              name: 'typography.h2',
              type: 'typography',
              value: {
                fontFamily: 'Roboto',
                fontSize: '3.75 * {text.size.base}',
                fontWeight: '7 * {text.fontWeight.base}',
              },
            },
            {
              description: 'Should be resolved',
              name: 'typography.h3',
              type: 'typography',
              value: {
                fontFamily: 'Roboto',
                fontSize: '3 * {text.size.base}',
                fontWeight: '5 * 100',
              },
            },
          ],
        },
      },
    };

    expect(convertTokensObjectToResolved(tokens, [], [], {
      expandTypography: false, expandShadow: false, preserveRawValue: false, resolveReferences: 'math',
    })).toMatchSnapshot();
  });
});
