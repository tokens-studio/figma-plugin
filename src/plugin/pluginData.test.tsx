import { NodeManagerNode } from './NodeManager';
import { transformPluginDataToSelectionValues } from './pluginData';

describe('pluginData', () => {
  it('transformPluginDataToSelectionValues', () => {
    figma.variables.getVariableById = jest.fn().mockReturnValue({
      id: 'VariableID:1:1',
      name: 'color/red/600',
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
        id: '1:2',
        node: {
          name: 'Frame 1',
          type: 'FRAME',
          boundVariables: {
            strokes: [
              {
                id: 'VariableID:1:1',
                type: 'VARIABLE_ALIAS',
              },
            ],
          },
          strokes: [
            {
              id: 'VariableID:1:1',
              type: 'SOLID',
              color: {
                r: 0.545098066329956,
                g: 0.45490196347236633,
                b: 0.3921568691730499,
              },
              opacity: 0.2,
            },
          ],
        } as unknown as FrameNode,
        tokens: { },
      },
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
        appliedType: 'variable',
        category: 'borderColor',
        nodes: [{
          id: '1:2',
          name: 'Frame 1',
          type: 'FRAME',
        }],
        resolvedValue: '#8b746433',
        type: 'borderColor',
        value: 'color.red.600',
      },
    ]);
  });
});
