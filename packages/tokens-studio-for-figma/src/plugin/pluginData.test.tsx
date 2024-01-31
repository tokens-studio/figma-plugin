import { NodeManagerNode } from './NodeManager';
import { transformPluginDataToSelectionValues } from './pluginData';

describe('pluginData', () => {
  it('transformPluginDataToSelectionValues', () => {
    figma.variables.getVariableById = jest.fn().mockReturnValue({
      id: 'VariableID:1:1',
      name: 'color/red/600',
    });

    figma.getStyleById = jest.fn().mockReturnValue({
      id: 'S:09f8a236c57aa2109cd257ebde4c8fc07800a2a3,',
      boundVariables: {},
      consumers: [
        {
          fields: ['strokeStyleId'],
        },
      ],
      description: '',
      documentationLinks: [],
      key: '09f8a236c57aa2109cd257ebde4c8fc07800a2a3',
      name: 'semantic/fg/accent',
      paints: [
        {
          blendMode: 'NORMAL',
          boundVariables: {},
          type: 'SOLID',
          color: {
            r: 0.545098066329956,
            g: 0.45490196347236633,
            b: 0.3921568691730499,
          },
          opacity: 1,
          visible: true,
        },
      ],
      remote: false,
      type: 'PAINT',
    });

    const pluginData = [
      {
        id: '5989:3',
        node: {
          name: 'Rectangle 1',
          type: 'RECTANGLE',
        } as unknown as BaseNode,
        tokens: {
          borderRadius: 'border-radius.8',
          fill: 'color.red.700',
          opacity: 'opacity.60',
        },
      } as NodeManagerNode,
      {
        id: '5989:4',
        node: {
          name: 'Frame 1',
          type: 'FRAME',
          strokes: [
            {
              blendMode: 'NORMAL',
              boundVariables: {},
              type: 'SOLID',
              color: {
                r: 0.545098066329956,
                g: 0.45490196347236633,
                b: 0.3921568691730499,
              },
              opacity: 1,
              visible: true,
            },
          ],
          strokeStyleId: 'S:09f8a236c57aa2109cd257ebde4c8fc07800a2a3,',
        } as unknown as FrameNode,
        tokens: { },
      } as NodeManagerNode,
    ];
    const selectionValues = transformPluginDataToSelectionValues(pluginData);

    expect(selectionValues).toEqual([
      {
        appliedType: 'token',
        category: 'borderRadius',
        nodes: [{
          id: '5989:3',
          name: 'Rectangle 1',
          type: 'RECTANGLE',
        }],
        type: 'borderRadius',
        value: 'border-radius.8',
      }, {
        appliedType: 'token',
        category: 'fill',
        nodes: [{
          id: '5989:3',
          name: 'Rectangle 1',
          type: 'RECTANGLE',
        }],
        type: 'fill',
        value: 'color.red.700',
      }, {
        appliedType: 'token',
        category: 'opacity',
        nodes: [{
          id: '5989:3',
          name: 'Rectangle 1',
          type: 'RECTANGLE',
        }],
        type: 'opacity',
        value: 'opacity.60',
      }, {
        appliedType: 'style',
        category: 'borderColor',
        nodes: [{
          id: '5989:4',
          name: 'Frame 1',
          type: 'FRAME',
        }],
        resolvedValue: '#8b7464',
        type: 'borderColor',
        value: 'semantic.fg.accent',
      },
    ]);
  });
});
