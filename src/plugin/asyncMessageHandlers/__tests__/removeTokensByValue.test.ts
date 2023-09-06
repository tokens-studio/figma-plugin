import { mockGetNodeById } from '../../../../tests/__mocks__/figmaMock';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { NodeManagerNode } from '../../NodeManager';
import { removePluginDataByMap } from '@/plugin/removePluginDataByMap';
import { removeTokensByValue } from '../removeTokensByValue';
import { Properties } from '@/constants/Properties';
import { NodeInfo } from '@/types/NodeInfo';

jest.mock('@/plugin/removePluginDataByMap', () => ({
  removePluginDataByMap: jest.fn(),
}));

describe('removeTokensByValue', () => {
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
    mockGetNodeById.mockImplementationOnce(() => ({
      id: '1234',
    } as BaseNode));
    await removeTokensByValue({
      type: AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE,
      tokensToRemove,
    });

    expect(removePluginDataByMap).toBeCalledWith({
      nodeKeyMap: [{
        key: 'fill',
        node: {
          id: '1234',
        } as NodeManagerNode,
      }],
    });
  });

  it('doesn\'t update the plugin when there is no nodes to update', async () => {
    mockGetNodeById.mockImplementationOnce(() => (null));
    await removeTokensByValue({
      type: AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE,
      tokensToRemove,
    });

    expect(removePluginDataByMap).toBeCalledTimes(0);
  });
});
