import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { bulkRemapTokens } from '../bulkRemapTokens';
import { defaultNodeManager } from '../../NodeManager';
import { UpdateMode } from '@/constants/UpdateMode';

describe('bulkRemapTokens', () => {
  const findNodesSpy = jest.spyOn(defaultNodeManager, 'findBaseNodesWithData');
  const mockSetSharedPluginData = jest.fn();

  it('should be able to replace all matching token names with new token name', async () => {
    findNodesSpy.mockImplementationOnce(() => Promise.resolve([
      {
        id: '295:3',
        node: {
          id: '295:3',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as BaseNode,
        tokens: {
          borderRadius: 'old.border-radius',
          fill: 'old.slate.400',
          sizing: 'old-size.450',
          spacing: 'something-else.foobar',
        },
      },
      {
        id: '295:4',
        node: {
          id: '295:4',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as RectangleNode,
        tokens: {
          fill: 'old.red.500',
          sizing: 'old-size.1600',
        },
      },
      {
        id: '295:5',
        node: {
          id: '295:5',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as TextNode,
        tokens: {
          fill: 'old-color.gray.300',
        },
      },
    ]));
    await bulkRemapTokens({
      type: AsyncMessageTypes.BULK_REMAP_TOKENS,
      oldName: 'old',
      newName: 'new',
      updateMode: UpdateMode.SELECTION,
    });

    expect(mockSetSharedPluginData).toHaveBeenCalledTimes(6);
    expect(mockSetSharedPluginData.mock.calls[0]).toEqual(['tokens', 'borderRadius', '"new.border-radius"']);
    expect(mockSetSharedPluginData.mock.calls[5]).toEqual(['tokens', 'fill', '"new-color.gray.300"']);
  });
});
