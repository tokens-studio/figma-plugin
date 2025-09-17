import pullStyles from './pullStyles';

import * as notifiers from './notifiers';

describe('pullStyles', () => {
  const notifyStyleValuesSpy = jest.spyOn(notifiers, 'notifyStyleValues');

  it('pulls color styles', async () => {
    figma.getLocalPaintStyles.mockReturnValue([
      {
        name: 'red/500',
        id: '456',
        description: 'the red one',
        paints: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 1 }],
      },
      {
        name: 'blue/500',
        id: '567',
        description: 'the blue one',
        paints: [{ type: 'other', color: { r: 0, g: 0, b: 1 }, opacity: 0.5 }],
      },
    ]);
    await pullStyles({ colorStyles: true });

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith({
      colors: [
        {
          name: 'red.500',
          type: 'color',
          value: '#ff0000',
          description: 'the red one',
        },
      ],
    });
  });

  it('pulls text styles', async () => {
    figma.getLocalTextStyles.mockReturnValue([
      {
        name: 'heading/h1/bold',
        id: '456',
        description: 'the big one',
        fontSize: 24.8,
        boundVariables: {
          fontSize: { id: 'fontSize-var-id-1' },
          lineHeight: { id: 'lineHeight-var-id-1' },
          letterSpacing: { id: 'letterSpacing-var-id-1' },
          paragraphSpacing: { id: 'paragraphSpacing-var-id-1' },
          fontFamily: { id: 'fontFamily-var-id-1' },
          fontStyle: { id: 'fontStyle-var-id-1' },
        },
        fontName: { family: 'Inter', style: 'Bold' },
        lineHeight: { unit: 'AUTO' },
        paragraphSpacing: 0,
        paragraphIndent: 0,
        letterSpacing: { unit: 'PERCENT', value: 0 },
        textCase: 'ORIGINAL',
        textDecoration: 'NONE',
      },
    ]);

    figma.variables.getLocalVariables.mockReturnValue([
      {
        id: 'fontSize-var-id-1',
        name: 'Typography/heading/fontSize/1',
        value: '24.8',
      },
      {
        id: 'lineHeight-var-id-1',
        name: 'Typography/heading/lineHeight/1',
        value: 'AUTO',
      },
      {
        id: 'letterSpacing-var-id-1',
        name: 'Typography/heading/letterSpacing/1',
        value: '0%',
      },
      {
        id: 'paragraphSpacing-var-id-1',
        name: 'Typography/heading/paragraphSpacing/1',
        value: '0',
      },
      {
        id: 'fontFamily-var-id-1',
        name: 'Typography/heading/fontFamily/1',
        value: 'Inter',
      },
      {
        id: 'fontStyle-var-id-1',
        name: 'Typography/heading/fontStyle/1',
        value: 'Bold',
      },
    ]);

    await pullStyles({ textStyles: true });

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith({
      typography: [
        {
          name: 'heading.h1.bold',
          type: 'typography',
          value: {
            fontFamily: '{fontFamilies.inter}',
            fontWeight: '{fontWeights.inter-0}',
            fontSize: '{fontSize.0}',
            lineHeight: '{lineHeights.0}',
            letterSpacing: '{letterSpacing.0}',
            paragraphSpacing: '{paragraphSpacing.0}',
            paragraphIndent: '{paragraphIndent.0}',
            textCase: '{textCase.none}',
            textDecoration: '{textDecoration.none}',
          },
          description: 'the big one',
        },
      ],
      fontFamilies: [
        { name: 'fontFamilies.inter', type: 'fontFamilies', value: 'Inter' },
      ],
      fontWeights: [
        { name: 'fontWeights.inter-0', type: 'fontWeights', value: 'Bold' },
      ],
      fontSizes: [
        { name: 'fontSize.0', type: 'fontSizes', value: '24.8' },
      ],
      letterSpacing: [
        { name: 'letterSpacing.0', type: 'letterSpacing', value: '0%' },
      ],
      lineHeights: [
        { name: 'lineHeights.0', type: 'lineHeights', value: 'AUTO' },
      ],
      paragraphSpacing: [
        { name: 'paragraphSpacing.0', type: 'paragraphSpacing', value: '0' },
      ],
      paragraphIndent: [
        { name: 'paragraphIndent.0', type: 'dimension', value: '0px' },
      ],
      textCase: [
        { name: 'textCase.none', type: 'textCase', value: 'none' },
      ],
      textDecoration: [
        { name: 'textDecoration.none', type: 'textDecoration', value: 'none' },
      ],
    });
  });

  it('pulls text styles without bound variables', async () => {
    figma.getLocalTextStyles.mockReturnValue([
      {
        name: 'heading/h1/regular',
        id: '456',
        description: 'the regular one',
        fontSize: 24,
        fontName: { family: 'Inter', style: 'Regular' },
        lineHeight: { unit: 'PIXELS', value: 32 },
        paragraphSpacing: 16,
        paragraphIndent: 8,
        letterSpacing: { unit: 'PIXELS', value: -0.5 },
        textCase: 'UPPER',
        textDecoration: 'UNDERLINE',
        boundVariables: {},
      },
    ]);

    await pullStyles({ textStyles: true });

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith({
      typography: [
        {
          name: 'heading.h1.regular',
          type: 'typography',
          value: {
            fontFamily: '{fontFamilies.inter}',
            fontWeight: '{fontWeights.inter-0}',
            fontSize: '{fontSize.0}',
            lineHeight: '{lineHeights.0}',
            letterSpacing: '{letterSpacing.0}',
            paragraphSpacing: '{paragraphSpacing.0}',
            paragraphIndent: '{paragraphIndent.0}',
            textCase: '{textCase.uppercase}',
            textDecoration: '{textDecoration.underline}',
          },
          description: 'the regular one',
        },
      ],
      fontFamilies: [
        { name: 'fontFamilies.inter', type: 'fontFamilies', value: 'Inter' },
      ],
      fontWeights: [
        { name: 'fontWeights.inter-0', type: 'fontWeights', value: 'Regular' },
      ],
      fontSizes: [
        { name: 'fontSize.0', type: 'fontSizes', value: '24' },
      ],
      letterSpacing: [
        { name: 'letterSpacing.0', type: 'letterSpacing', value: '-0.5' },
      ],
      lineHeights: [
        { name: 'lineHeights.0', type: 'lineHeights', value: '32' },
      ],
      paragraphSpacing: [
        { name: 'paragraphSpacing.0', type: 'paragraphSpacing', value: '16' },
      ],
      paragraphIndent: [
        { name: 'paragraphIndent.0', type: 'dimension', value: '8px' },
      ],
      textCase: [
        { name: 'textCase.uppercase', type: 'textCase', value: 'uppercase' },
      ],
      textDecoration: [
        { name: 'textDecoration.underline', type: 'textDecoration', value: 'underline' },
      ],
    });
  });

  it('pulls text styles with bound variables but no matching tokens', async () => {
    figma.getLocalTextStyles.mockReturnValue([
      {
        name: 'heading/h1/bold',
        id: '456',
        description: 'text style with variables but no tokens',
        fontSize: 32,
        boundVariables: {
          fontSize: { id: 'fontSize-var-id-1' },
          lineHeight: { id: 'lineHeight-var-id-1' },
          letterSpacing: { id: 'letterSpacing-var-id-1' },
          paragraphSpacing: { id: 'paragraphSpacing-var-id-1' },
          fontFamily: { id: 'fontFamily-var-id-1' },
          fontStyle: { id: 'fontStyle-var-id-1' },
        },
        fontName: { family: 'Roboto', style: 'Bold' },
        lineHeight: { unit: 'PIXELS', value: 40 },
        paragraphSpacing: 12,
        paragraphIndent: 0,
        letterSpacing: { unit: 'PERCENT', value: 2 },
        textCase: 'ORIGINAL',
        textDecoration: 'NONE',
      },
    ]);

    // Variables exist in Figma but no matching tokens in token store
    figma.variables.getLocalVariables.mockReturnValue([
      {
        id: 'fontSize-var-id-1',
        name: 'Typography/heading/fontSize/1',
        value: '32',
      },
      {
        id: 'lineHeight-var-id-1',
        name: 'Typography/heading/lineHeight/1',
        value: '40',
      },
      {
        id: 'letterSpacing-var-id-1',
        name: 'Typography/heading/letterSpacing/1',
        value: '2%',
      },
      {
        id: 'paragraphSpacing-var-id-1',
        name: 'Typography/heading/paragraphSpacing/1',
        value: '12',
      },
      {
        id: 'fontFamily-var-id-1',
        name: 'Typography/heading/fontFamily/1',
        value: 'Roboto',
      },
      {
        id: 'fontStyle-var-id-1',
        name: 'Typography/heading/fontStyle/1',
        value: 'Bold',
      },
    ]);

    await pullStyles({ textStyles: true });

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith({
      typography: [
        {
          name: 'heading.h1.bold',
          type: 'typography',
          value: {
            fontFamily: 'Roboto', // Should use raw value when no token found
            fontWeight: 'Bold', // Should use raw value when no token found
            fontSize: '32', // Should use raw value when no token found
            lineHeight: '40', // Should use raw value when no token found
            letterSpacing: '2%', // Should use raw value when no token found
            paragraphSpacing: '12', // Should use raw value when no token found
            paragraphIndent: '0px', // Raw value
            textCase: 'none', // Raw value
            textDecoration: 'none', // Raw value
          },
          description: 'text style with variables but no tokens',
        },
      ],
      fontFamilies: [
        { name: 'fontFamilies.roboto', type: 'fontFamilies', value: 'Roboto' },
      ],
      fontWeights: [
        { name: 'fontWeights.roboto-0', type: 'fontWeights', value: 'Bold' },
      ],
      fontSizes: [
        { name: 'fontSize.0', type: 'fontSizes', value: '32' },
      ],
      letterSpacing: [
        { name: 'letterSpacing.0', type: 'letterSpacing', value: '2%' },
      ],
      lineHeights: [
        { name: 'lineHeights.0', type: 'lineHeights', value: '40' },
      ],
      paragraphSpacing: [
        { name: 'paragraphSpacing.0', type: 'paragraphSpacing', value: '12' },
      ],
      paragraphIndent: [
        { name: 'paragraphIndent.0', type: 'dimension', value: '0px' },
      ],
      textCase: [
        { name: 'textCase.none', type: 'textCase', value: 'none' },
      ],
      textDecoration: [
        { name: 'textDecoration.none', type: 'textDecoration', value: 'none' },
      ],
    });
  });

  it('pulls shadow styles', async () => {
    figma.getLocalEffectStyles.mockReturnValue([
      {
        name: 'shadow/large',
        id: '789',
        description: 'the one with one shadow',
        effects: [
          {
            type: 'DROP_SHADOW',
            visible: true,
            color: {
              r: 0,
              g: 0,
              b: 0,
              a: 0.5,
            },
            offset: { x: 0, y: 0 },
            radius: 10,
            spread: 0,
            blendMode: 'NORMAL',
          },
        ],
      },
      {
        name: 'shadow/xlarge',
        id: '789',
        description: 'the one with multiple shadows',
        effects: [
          {
            type: 'DROP_SHADOW',
            visible: true,
            color: {
              r: 0,
              g: 0,
              b: 0,
              a: 0.5,
            },
            offset: { x: 0, y: 0 },
            radius: 2,
            spread: 4,
            blendMode: 'NORMAL',
          },
          {
            type: 'DROP_SHADOW',
            visible: true,
            color: {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            },
            offset: { x: 0, y: 4 },
            radius: 4,
            spread: 4,
            blendMode: 'NORMAL',
          },
          {
            type: 'DROP_SHADOW',
            visible: true,
            color: {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            },
            offset: { x: 0, y: 8 },
            radius: 16,
            spread: 4,
            blendMode: 'NORMAL',
          },
        ],
      },
      {
        name: 'shadow/mixed',
        id: '789',
        description: 'the one with mixed shadows',
        effects: [
          {
            type: 'INNER_SHADOW',
            visible: true,
            color: {
              r: 0,
              g: 0,
              b: 0,
              a: 0.5,
            },
            offset: { x: 0, y: 0 },
            radius: 2,
            spread: 4,
            blendMode: 'NORMAL',
          },
          {
            type: 'DROP_SHADOW',
            visible: true,
            color: {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            },
            offset: { x: 0, y: 4 },
            radius: 4,
            spread: 4,
            blendMode: 'NORMAL',
          },
          {
            type: 'DROP_SHADOW',
            visible: true,
            color: {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            },
            offset: { x: 0, y: 8 },
            radius: 16,
            spread: 4,
            blendMode: 'NORMAL',
          },
        ],
      },
    ]);
    await pullStyles({ effectStyles: true });

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith({
      effects: [
        {
          name: 'shadow.large',
          type: 'boxShadow',
          description: 'the one with one shadow',
          value: {
            type: 'dropShadow',
            color: '#00000080',
            x: 0,
            y: 0,
            blur: 10,
            spread: 0,
          },
        },
        {
          name: 'shadow.xlarge',
          type: 'boxShadow',
          description: 'the one with multiple shadows',
          value: [
            {
              type: 'dropShadow',
              color: '#000000',
              x: 0,
              y: 8,
              blur: 16,
              spread: 4,
            },
            {
              type: 'dropShadow',
              color: '#000000',
              x: 0,
              y: 4,
              blur: 4,
              spread: 4,
            },
            {
              type: 'dropShadow',
              color: '#00000080',
              x: 0,
              y: 0,
              blur: 2,
              spread: 4,
            },
          ],
        },
        {
          name: 'shadow.mixed',
          type: 'boxShadow',
          description: 'the one with mixed shadows',
          value: [
            {
              type: 'dropShadow',
              color: '#000000',
              x: 0,
              y: 8,
              blur: 16,
              spread: 4,
            },
            {
              type: 'dropShadow',
              color: '#000000',
              x: 0,
              y: 4,
              blur: 4,
              spread: 4,
            },
            {
              type: 'innerShadow',
              color: '#00000080',
              x: 0,
              y: 0,
              blur: 2,
              spread: 4,
            },
          ],
        },
      ],
    });
  });
});
