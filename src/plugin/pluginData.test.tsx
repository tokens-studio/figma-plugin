import { defaultNodeManager, NodeManagerNode } from './NodeManager';
import { updatePluginData } from './pluginData';

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
});
