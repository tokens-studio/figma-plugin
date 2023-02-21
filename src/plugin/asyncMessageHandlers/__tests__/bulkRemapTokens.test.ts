import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { bulkRemapTokens } from '../bulkRemapTokens';
import { defaultNodeManager } from '../../NodeManager';
import { updatePluginData } from '@/plugin/pluginData';

jest.mock('@/plugin/pluginData', (() => ({
  updatePluginData: jest.fn(),
})));

describe('bulkRemapTokens', () => {
  const findNodesSpy = jest.spyOn(defaultNodeManager, 'findNodesWithData');
  it('should be able to replace all matching token names with new token name', async () => {
    findNodesSpy.mockImplementationOnce(() => Promise.resolve([
      {
        hash: '9c7e97584a40179e12c9e2c75d34f80e66fe6f64',
        id: '295:3',
        node: {
          id: '295:3',
        } as RectangleNode,
        tokens: {
          borderRadius: 'old.border-radius',
          fill: 'old.slate.400',
          sizing: 'old-size.450',
        },
      },
      {
        hash: '9c7e97584a40179e12c9e2c75d34f80e66fe6f64',
        id: '295:4',
        node: {
          id: '295:4',
        } as RectangleNode,
        tokens: {
          fill: 'old.red.500',
          sizing: 'old-size.1600',
        },
      },
      {
        hash: '9c7e97584a40179e12c9e2c75d34f80e66fe6f64',
        id: '295:5',
        node: {
          id: '295:5',
        } as TextNode,
        tokens: {
          fill: 'old-color.gray.300',
        },
      },
    ]));
    await bulkRemapTokens({
      type: AsyncMessageTypes.BULK_REMAP_TOKENS,
      oldName: 'old',
      newName: 'new',
    });

    expect(updatePluginData).toBeCalledWith({
      entries: [{
        hash: '9c7e97584a40179e12c9e2c75d34f80e66fe6f64',
        id: '295:3',
        node: {
          id: '295:3',
        } as RectangleNode,
        tokens: {
          borderRadius: 'new.border-radius',
          fill: 'new.slate.400',
          sizing: 'new-size.450',
        },
      },
      {
        hash: '9c7e97584a40179e12c9e2c75d34f80e66fe6f64',
        id: '295:4',
        node: {
          id: '295:4',
        } as RectangleNode,
        tokens: {
          fill: 'new.red.500',
          sizing: 'new-size.1600',
        },
      },
      {
        hash: '9c7e97584a40179e12c9e2c75d34f80e66fe6f64',
        id: '295:5',
        node: {
          id: '295:5',
        } as TextNode,
        tokens: {
          fill: 'new-color.gray.300',
        },
      }],
      values: {},
      shouldOverride: true,
    });
  });
});
