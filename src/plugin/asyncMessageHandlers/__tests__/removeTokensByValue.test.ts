import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { defaultNodeManager, NodeManagerNode } from '../../NodeManager';
import { updatePluginData } from '@/plugin/pluginData';
import { removeTokensByValue } from '../removeTokensByValue';
import { Properties } from '@/constants/Properties';
import { NodeInfo } from '@/types/NodeInfo';

jest.mock('@/plugin/pluginData', () => ({
  updatePluginData: jest.fn(),
}));

describe('removeTokensByValue', () => {
  const getNodeSpy = jest.spyOn(defaultNodeManager, 'getNode');
  const tokensToRemove = [
    {
      nodes: [
        {
          id: '1234',
          name: 'text node',
          type: 'TEXT',
        } as NodeInfo,
      ],
      property: Properties.fill,
    },
  ];

  it('should remove tokens by value', async () => {
    getNodeSpy.mockImplementationOnce(() => Promise.resolve({
      createdAt: 1665107195149,
      hash: '2345',
      id: '1234',
      node: {
        id: '1234',
      } as BaseNode,
      tokens: {
        fill: 'color.red.800',
        fontFamilies: 'font-family.Inter',
        fontSizes: 'font-size.6',
      },
    } as NodeManagerNode));
    await removeTokensByValue({
      type: AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE,
      tokensToRemove,
    });

    expect(updatePluginData).toBeCalledWith({
      entries: [{
        createdAt: 1665107195149,
        hash: '2345',
        id: '1234',
        node: {
          id: '1234',
        } as BaseNode,
        tokens: {
          fill: 'color.red.800',
          fontFamilies: 'font-family.Inter',
          fontSizes: 'font-size.6',
        },
      }],
      values: {
        fill: 'delete',
      },
      shouldRemove: false,
    });
  });

  it('doesn\'t update the plugin when there is no nodes to update', async () => {
    getNodeSpy.mockImplementationOnce(() => Promise.resolve(undefined));
    await removeTokensByValue({
      type: AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE,
      tokensToRemove,
    });

    expect(updatePluginData).toBeCalledTimes(0);
  });
});
