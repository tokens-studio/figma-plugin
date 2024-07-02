import { TokenTypes } from '@/constants/TokenTypes';
import convertTokensObjectToResolved from '../convertTokensObjectToResolved';

describe('convertTokensObjectToResolved', () => {
  it('converts object-like unresolved tokens to resolved object', () => {
    const tokens = {
      options: {
        colors: {
          red: {
            value: '#ff0000',
            type: TokenTypes.COLOR,
          },
          blue: {
            value: '#0000ff',
            type: TokenTypes.COLOR,
          },
        },
        sizing: {
          base: {
            value: '2',
            type: TokenTypes.SIZING,
          },
          scale: {
            value: '1.5',
            type: TokenTypes.SIZING,
          },
          small: {
            value: '1 * {sizing.base}',
            type: TokenTypes.SIZING,
          },
          medium: {
            value: '{sizing.small} * {sizing.scale}',
            type: TokenTypes.SIZING,
          },
        },
      },
      theme: {
        colors: {
          primary: {
            value: '$colors.red',
            type: TokenTypes.COLOR,
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
            type: TokenTypes.COLOR,
          },
          black: {
            value: '#000000',
            type: TokenTypes.COLOR,
          },
        },
      },
      light: {
        colors: {
          background: {
            value: '$colors.white',
            type: TokenTypes.COLOR,
          },
        },
      },
      dark: {
        colors: {
          background: {
            value: '$colors.black',
            type: TokenTypes.COLOR,
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
          type: TokenTypes.TYPOGRAPHY,
          value: {
            fontFamily: 'Roboto',
            fontSize: '96',
            fontWeight: 'Light',
          },
        },
        {
          name: 'typography.h2',
          type: TokenTypes.TYPOGRAPHY,
          value: {
            fontFamily: 'Roboto',
            fontSize: '60',
            fontWeight: 'Light',
          },
        },
        {
          name: 'typography.h3',
          type: TokenTypes.TYPOGRAPHY,
          value: {
            fontFamily: 'Roboto',
            fontSize: '48',
            fontWeight: 'Light',
          },
        },
      ],
    };

    expect(convertTokensObjectToResolved(tokens, [], [], {
      expandTypography: false, expandShadow: false, expandComposition: false, expandBorder: false, preserveRawValue: false,
    })).toMatchSnapshot();
  });

  it('does not expand shadows when not needed', () => {
    const tokens = {
      options: [
        {
          name: 'shadow.1',
          type: TokenTypes.BOX_SHADOW,
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
          type: TokenTypes.BOX_SHADOW,
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

    expect(convertTokensObjectToResolved(tokens, [], [], {
      expandTypography: false, expandShadow: false, expandComposition: false, expandBorder: false, preserveRawValue: true,
    })).toMatchSnapshot();
  });

  it('does not expand composition when not needed', () => {
    const tokens = {
      global: {
        size: {
          12: {
            type: TokenTypes.SIZING,
            value: '12',
          },
        },
        space: {
          24: {
            type: TokenTypes.SPACING,
            value: '24',
          },
        },
        opacity: {
          50: {
            type: TokenTypes.OPACITY,
            value: '50%',
          },
        },
        composition: {
          heading: {
            type: TokenTypes.COMPOSITION,
            value: {
              opacity: '{opacity.50}',
            },
          },
          body: {
            type: TokenTypes.COMPOSITION,
            value: {
              sizing: '{size.12}',
              spacing: '{space.24}',
            },
          },
        },
      },
    };

    expect(convertTokensObjectToResolved(tokens, [], [], {
      expandTypography: false, expandShadow: false, expandComposition: false, expandBorder: false, preserveRawValue: true,
    })).toMatchSnapshot();
  });

  it('should expand composition when needed', () => {
    const tokens = {
      global: {
        size: {
          12: {
            type: TokenTypes.SIZING,
            value: '12',
          },
        },
        space: {
          24: {
            type: TokenTypes.SPACING,
            value: '24',
          },
        },
        opacity: {
          50: {
            type: TokenTypes.OPACITY,
            value: '50%',
          },
        },
        composition: {
          heading: {
            type: TokenTypes.COMPOSITION,
            value: {
              opacity: '{opacity.50}',
            },
          },
          body: {
            type: TokenTypes.COMPOSITION,
            value: {
              sizing: '{size.12}',
              spacing: '{space.24}',
            },
          },
        },
      },
    };

    expect(convertTokensObjectToResolved(tokens, [], [], {
      expandTypography: false, expandShadow: false, expandComposition: true, expandBorder: true, preserveRawValue: true,
    })).toMatchSnapshot();
  });

  it('preserves rawValue when requested', () => {
    const tokens = {
      global: {
        colors: {
          white: {
            value: '#ffffff',
            type: TokenTypes.COLOR,
          },
          black: {
            value: '#000000',
            type: TokenTypes.COLOR,
          },
        },
      },
      light: {
        colors: {
          background: {
            value: '$colors.white',
            type: TokenTypes.COLOR,
          },
        },
      },
      dark: {
        colors: {
          background: {
            value: '$colors.black',
            type: TokenTypes.COLOR,
          },
        },
      },
    };

    expect(convertTokensObjectToResolved(tokens, [], [], {
      expandTypography: false, expandShadow: false, expandComposition: false, expandBorder: true, preserveRawValue: true,
    })).toMatchSnapshot();
  });

  it('resolves all references when requested', () => {
    const tokens = {
      global: {
        colors: {
          blue: {
            type: TokenTypes.COLOR,
            value: '#0000ff',
          },
          primary: {
            description: 'Should be resolved',
            type: TokenTypes.COLOR,
            value: '$colors.red',
          },
          red: {
            type: TokenTypes.COLOR,
            value: '#ff0000',
          },
          opaqueRed: {
            description: 'Should be resolved',
            type: TokenTypes.COLOR,
            value: 'rgba(255, 0, 0, {opacity.medium})',
          },
        },
        opacity: {
          medium: {
            type: TokenTypes.OPACITY,
            value: '0.5',
          },
        },
        radii: {
          full: {
            value: '100%',
            type: TokenTypes.BORDER_RADIUS,
          },
          leaf: {
            description: 'Should be resolved',
            value: '{radii.full} 0%',
            type: TokenTypes.BORDER_RADIUS,
          },
        },
        sizing: {
          base: {
            value: '2',
            type: TokenTypes.SIZING,
          },
          scale: {
            value: '1.5',
            type: TokenTypes.SIZING,
          },
          xsmall: {
            description: 'Should be resolved',
            value: '1 * {sizing.base}',
            type: TokenTypes.SIZING,
          },
          small: {
            description: 'Should be resolved',
            value: '{sizing.base}',
            type: TokenTypes.SIZING,
          },
          medium: {
            description: 'Should be resolved',
            value: '{sizing.small} * {sizing.scale}',
            type: TokenTypes.SIZING,
          },
          large: {
            description: 'Should be resolved',
            value: '$sizing.medium * $sizing.scale',
            type: TokenTypes.SIZING,
          },
          responsive25: {
            description: 'Should be resolved',
            value: 'calc(25vw * $sizing.small)',
            type: TokenTypes.SIZING,
          },
          responsive50: {
            description: 'Should be resolved',
            value: 'calc(50vw - {sizing.large}px)',
            type: TokenTypes.SIZING,
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
        },
        typography: {
          h1: {
            description: 'Should be resolved',
            name: 'typography.h1',
            type: TokenTypes.TYPOGRAPHY,
            value: {
              fontFamily: 'Roboto',
              fontSize: '{text.size.h1}',
              fontWeight: '{text.fontWeight.light}',
            },
          },
          h2: {
            description: 'Should be resolved',
            type: TokenTypes.TYPOGRAPHY,
            value: {
              fontFamily: 'Roboto',
              fontSize: '3.75 * {text.size.base}',
              fontWeight: '7 * {text.fontWeight.base}',
            },
          },
          h3: {
            description: 'Should be resolved',
            type: TokenTypes.TYPOGRAPHY,
            value: {
              fontFamily: 'Roboto',
              fontSize: '3 * {text.size.base}',
              fontWeight: '5 * 100',
            },
          },
        },
      },
    };

    expect(convertTokensObjectToResolved(tokens, [], [], {
      expandTypography: false, expandShadow: false, expandComposition: false, expandBorder: false, preserveRawValue: false, resolveReferences: true,
    })).toMatchSnapshot();
  });

  it('preserves all references when requested', () => {
    const tokens = {
      global: {
        colors: {
          blue: {
            type: TokenTypes.COLOR,
            value: '#0000ff',
          },
          primary: {
            description: 'Should NOT be resolved',
            type: TokenTypes.COLOR,
            value: '$colors.red',
          },
          red: {
            type: TokenTypes.COLOR,
            value: '#ff0000',
          },
          opaqueRed: {
            description: 'Should NOT be resolved',
            type: TokenTypes.COLOR,
            value: 'rgba(255, 0, 0, {opacity.medium})',
          },
        },
        opacity: {
          medium: {
            type: TokenTypes.OPACITY,
            value: '0.5',
          },
        },
        radii: {
          full: {
            value: '100%',
            type: TokenTypes.BORDER_RADIUS,
          },
          leaf: {
            description: 'Should NOT be resolved',
            value: '{radii.full} 0%',
            type: TokenTypes.BORDER_RADIUS,
          },
        },
        sizing: {
          base: {
            value: '2',
            type: TokenTypes.SIZING,
          },
          scale: {
            value: '1.5',
            type: TokenTypes.SIZING,
          },
          xsmall: {
            description: 'Should NOT be resolved',
            value: '1 * {sizing.base}',
            type: TokenTypes.SIZING,
          },
          small: {
            description: 'Should NOT be resolved',
            value: '{sizing.base}',
            type: TokenTypes.SIZING,
          },
          medium: {
            description: 'Should NOT be resolved',
            value: '{sizing.small} * {sizing.scale}',
            type: TokenTypes.SIZING,
          },
          large: {
            description: 'Should NOT be resolved',
            value: '$sizing.medium * $sizing.scale',
            type: TokenTypes.SIZING,
          },
          responsive25: {
            description: 'Should NOT be resolved',
            value: 'calc(25vw * $sizing.small)',
            type: TokenTypes.SIZING,
          },
          responsive50: {
            description: 'Should NOT be resolved',
            value: 'calc(50vw - {sizing.large}px)',
            type: TokenTypes.SIZING,
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
        },
        typography: {
          h1: {
            description: 'Should NOT be resolved',
            type: TokenTypes.TYPOGRAPHY,
            value: {
              fontFamily: 'Roboto',
              fontSize: '{text.size.h1}',
              fontWeight: '{text.fontWeight.light}',
            },
          },
          h2: {
            description: 'Should NOT be resolved',
            type: TokenTypes.TYPOGRAPHY,
            value: {
              fontFamily: 'Roboto',
              fontSize: '3.75 * {text.size.base}',
              fontWeight: '7 * {text.fontWeight.base}',
            },
          },
          h3: {
            description: 'Should NOT be resolved',
            type: TokenTypes.TYPOGRAPHY,
            value: {
              fontFamily: 'Roboto',
              fontSize: '3 * {text.size.base}',
              fontWeight: '5 * 100',
            },
          },
        },
      },
    };

    expect(convertTokensObjectToResolved(tokens, [], [], {
      expandTypography: false, expandShadow: false, expandComposition: false, expandBorder: false, preserveRawValue: false, resolveReferences: false,
    })).toMatchSnapshot();
  });

  it('resolves only math expressions when requested', () => {
    const tokens = {
      global: {
        colors: {
          blue: {
            type: TokenTypes.COLOR,
            value: '#0000ff',
          },
          primary: {
            description: 'Should NOT be resolved',
            type: TokenTypes.COLOR,
            value: '$colors.red',
          },
          red: {
            type: TokenTypes.COLOR,
            value: '#ff0000',
          },
          opaqueRed: {
            description: 'Should NOT be resolved',
            type: TokenTypes.COLOR,
            value: 'rgba(255, 0, 0, {opacity.medium})',
          },
        },
        opacity: {
          medium: {
            type: TokenTypes.OPACITY,
            value: '0.5',
          },
        },
        radii: {
          full: {
            value: '100%',
            type: TokenTypes.BORDER_RADIUS,
          },
          leaf: {
            description: 'Should NOT be resolved',
            value: '{radii.full} 0%',
            type: TokenTypes.BORDER_RADIUS,
          },
        },
        sizing: {
          base: {
            value: '2',
            type: TokenTypes.SIZING,
          },
          scale: {
            value: '1.5',
            type: TokenTypes.SIZING,
          },
          xsmall: {
            description: 'Should be resolved',
            value: '1 * {sizing.base}',
            type: TokenTypes.SIZING,
          },
          small: {
            description: 'Should NOT be resolved',
            value: '{sizing.base}',
            type: TokenTypes.SIZING,
          },
          medium: {
            description: 'Should be resolved',
            value: '{sizing.small} * {sizing.scale}',
            type: TokenTypes.SIZING,
          },
          large: {
            description: 'Should be resolved',
            value: '$sizing.medium * $sizing.scale',
            type: TokenTypes.SIZING,
          },
          responsive25: {
            description: 'Should NOT be resolved',
            value: 'calc(25vw * $sizing.small)',
            type: TokenTypes.SIZING,
          },
          responsive50: {
            description: 'Should NOT be resolved',
            value: 'calc(50vw - {sizing.large}px)',
            type: TokenTypes.SIZING,
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
        },
        typography: {
          h1: {
            description: 'Should NOT be resolved',
            type: TokenTypes.TYPOGRAPHY,
            value: {
              fontFamily: 'Roboto',
              fontSize: '{text.size.base}',
              fontWeight: '{text.fontWeight.light}',
            },
          },
          h2: {
            description: 'Should be resolved',
            type: TokenTypes.TYPOGRAPHY,
            value: {
              fontFamily: 'Roboto',
              fontSize: '3.75 * {text.size.base}',
              fontWeight: '7 * {text.fontWeight.base}',
            },
          },
          h3: {
            description: 'Should be resolved',
            type: TokenTypes.TYPOGRAPHY,
            value: {
              fontFamily: 'Roboto',
              fontSize: '3 * {text.size.base}',
              fontWeight: '5 * 100',
            },
          },
        },
      },
    };

    expect(convertTokensObjectToResolved(tokens, [], [], {
      expandTypography: false, expandShadow: false, expandComposition: false, expandBorder: false, preserveRawValue: false, resolveReferences: 'math',
    })).toMatchSnapshot();
  });
});
