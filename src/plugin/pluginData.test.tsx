import { NodeManagerNode } from './NodeManager';
import { transformPluginDataToSelectionValues } from './pluginData';

describe('pluginData', () => {
  it('transformPluginDataToSelectionValues', () => {
    const pluginData = [{
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
    } as NodeManagerNode];
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
      },
    ]);
  });
});
