import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { bulkRemapTokens } from '../bulkRemapTokens';
import { defaultNodeManager } from '../../NodeManager';
import { UpdateMode } from '@/constants/UpdateMode';

describe('bulkRemapTokens', () => {
  const findNodesSpy = jest.spyOn(defaultNodeManager, 'findBaseNodesWithData');
  const mockSetSharedPluginData = jest.fn();

  it('should be able to replace all matching token names with new token name', async () => {
    findNodesSpy.mockImplementationOnce(() => {
      const baseNodes = [];
      for (let i = 0; i < 100; i += 1) {
        baseNodes.push({
          id: `295:${i + 1}`,
          node: {
            id: `295:${i + 1}`,
            setSharedPluginData: mockSetSharedPluginData,
          } as unknown as BaseNode,
          tokens: {
            borderRadius: 'old.border-radius',
            fill: 'old.slate.400',
            sizing: 'old-size.450',
            spacing: 'something-else.foobar',
          },
        });
      }
      return Promise.resolve(baseNodes);
    });
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
