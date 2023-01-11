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
        fontSize: 24,
        fontName: {
          family: 'Inter',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        paragraphSpacing: 0,
        paragraphIndent: 0,
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        textCase: 'ORIGINAL',
        textDecoration: 'NONE',
      },
      {
        name: 'heading/h2/regular',
        id: '456',
        description: 'the small regular one',
        fontSize: 16,
        fontName: {
          family: 'Inter',
          style: 'Regular',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        paragraphSpacing: 3,
        paragraphIndent: 3,
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        textCase: 'ORIGINAL',
        textDecoration: 'NONE',
      },
      {
        name: 'copy/regular',
        id: '121',
        description: '',
        fontSize: 16,
        fontName: {
          family: 'Roboto',
          style: 'Regular',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        paragraphSpacing: 7,
        paragraphIndent: 7,
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        textCase: 'ORIGINAL',
        textDecoration: 'NONE',
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
            fontSize: '{fontSize.1}',
            letterSpacing: '{letterSpacing.0}',
            lineHeight: '{lineHeights.0}',
            paragraphSpacing: '{paragraphSpacing.0}',
            paragraphIndent: '{paragraphIndent.0}',
            textCase: '{textCase.none}',
            textDecoration: '{textDecoration.none}',
          },
          description: 'the big one',
        },
        {
          name: 'heading.h2.regular',
          type: 'typography',
          value: {
            fontFamily: '{fontFamilies.inter}',
            fontWeight: '{fontWeights.inter-1}',
            fontSize: '{fontSize.0}',
            letterSpacing: '{letterSpacing.0}',
            lineHeight: '{lineHeights.0}',
            paragraphSpacing: '{paragraphSpacing.1}',
            paragraphIndent: '{paragraphIndent.1}',
            textCase: '{textCase.none}',
            textDecoration: '{textDecoration.none}',
          },
          description: 'the small regular one',
        },
        {
          name: 'copy.regular',
          type: 'typography',
          value: {
            fontFamily: '{fontFamilies.roboto}',
            fontWeight: '{fontWeights.roboto-2}',
            fontSize: '{fontSize.0}',
            letterSpacing: '{letterSpacing.0}',
            lineHeight: '{lineHeights.0}',
            paragraphSpacing: '{paragraphSpacing.2}',
            paragraphIndent: '{paragraphIndent.2}',
            textCase: '{textCase.none}',
            textDecoration: '{textDecoration.none}',
          },
        },
      ],
      fontFamilies: [
        { name: 'fontFamilies.inter', type: 'fontFamilies', value: 'Inter' },
        { name: 'fontFamilies.roboto', type: 'fontFamilies', value: 'Roboto' },
      ],
      lineHeights: [{ name: 'lineHeights.0', type: 'lineHeights', value: 'AUTO' }],
      fontWeights: [
        { name: 'fontWeights.inter-0', type: 'fontWeights', value: 'Bold' },
        { name: 'fontWeights.inter-1', type: 'fontWeights', value: 'Regular' },
        { name: 'fontWeights.roboto-2', type: 'fontWeights', value: 'Regular' },
      ],
      fontSizes: [
        { name: 'fontSize.0', type: 'fontSizes', value: '16' },
        { name: 'fontSize.1', type: 'fontSizes', value: '24' },
      ],
      letterSpacing: [{ name: 'letterSpacing.0', type: 'letterSpacing', value: '0%' }],
      paragraphSpacing: [{ name: 'paragraphSpacing.0', type: 'paragraphSpacing', value: '0' },
        { name: 'paragraphSpacing.1', type: 'paragraphSpacing', value: '3' },
        { name: 'paragraphSpacing.2', type: 'paragraphSpacing', value: '7' }],
      textCase: [{ name: 'textCase.none', type: 'textCase', value: 'none' }],
      textDecoration: [{ name: 'textDecoration.none', type: 'textDecoration', value: 'none' }],
      paragraphIndent: [
        {
          name: 'paragraphIndent.0',
          type: 'dimension',
          value: '0px',
        },
        {
          name: 'paragraphIndent.1',
          type: 'dimension',
          value: '3px',
        },
        {
          name: 'paragraphIndent.2',
          type: 'dimension',
          value: '7px',
        },
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
              color: '#00000080',
              x: 0,
              y: 0,
              blur: 2,
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
              color: '#000000',
              x: 0,
              y: 8,
              blur: 16,
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
              type: 'innerShadow',
              color: '#00000080',
              x: 0,
              y: 0,
              blur: 2,
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
              color: '#000000',
              x: 0,
              y: 8,
              blur: 16,
              spread: 4,
            },
          ],
        },
      ],
    });
  });
});
