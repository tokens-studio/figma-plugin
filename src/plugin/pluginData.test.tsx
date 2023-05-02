import { mockGetNodeById } from '../../tests/__mocks__/figmaMock';
import { defaultNodeManager, NodeManagerNode } from './NodeManager';
import { transformPluginDataToSelectionValues, updatePluginData } from './pluginData';

describe('pluginData', () => {
  const mockSetPluginData = jest.fn();
  const mockGetPluginData = jest.fn();
  const mockSetSharedPluginData = jest.fn();
  const mockGetSharedPluginData = jest.fn();
  const mockGetSharedPluginDataKeys = jest.fn();
  const mockGetRelaunchData = jest.fn();
  const mockSetRelaunchData = jest.fn();
  const updateNodeSpy = jest.spyOn(defaultNodeManager, 'updateNode');

  it('updatePluginData', async () => {
    updateNodeSpy.mockResolvedValue([]);
    mockGetRelaunchData.mockResolvedValue({ edit: 'edit' });
    mockGetNodeById.mockResolvedValue({ id: '5989:3' });

    const entries = [{
      id: '5989:3',
      node: {
        name: 'Rectangle 1',
        setPluginData: mockSetPluginData,
        getPluginData: mockGetPluginData,
        setSharedPluginData: mockSetSharedPluginData,
        getSharedPluginData: mockGetSharedPluginData,
        getSharedPluginDataKeys: mockGetSharedPluginDataKeys,
        getRelaunchData: mockGetRelaunchData,
        setRelaunchData: mockSetRelaunchData,
      } as unknown as BaseNode,
      tokens: {
        fill: 'color.slate.900',
      },
    } as NodeManagerNode];
    const values = {
      borderRadius: 'none',
      fill: 'none',
    };

    await updatePluginData({ entries, values });

    expect(updateNodeSpy).toBeCalledWith({
      name: 'Rectangle 1',
      setPluginData: mockSetPluginData,
      getPluginData: mockGetPluginData,
      setSharedPluginData: mockSetSharedPluginData,
      getSharedPluginData: mockGetSharedPluginData,
      getSharedPluginDataKeys: mockGetSharedPluginDataKeys,
      getRelaunchData: mockGetRelaunchData,
      setRelaunchData: mockSetRelaunchData,
    }, {
      borderRadius: 'none',
      fill: 'none',
    });
  });

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
        category: 'borderRadius',
        nodes: [{
          id: '5989:3',
          name: 'Rectangle 1',
          type: 'RECTANGLE',
        }],
        type: 'borderRadius',
        value: 'border-radius.8',
      }, {
        category: 'fill',
        nodes: [{
          id: '5989:3',
          name: 'Rectangle 1',
          type: 'RECTANGLE',
        }],
        type: 'fill',
        value: 'color.red.700',
      }, {
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
