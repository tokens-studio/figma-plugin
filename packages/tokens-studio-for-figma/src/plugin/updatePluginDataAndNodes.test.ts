import { TokenTypes } from '@/constants/TokenTypes';
import { mockGetNodeById } from '../../tests/__mocks__/figmaMock';
import * as setValuesOnNode from './setValuesOnNode';
import { updatePluginDataAndNodes } from './updatePluginDataAndNodes';
import { SingleToken } from '@/types/tokens';

describe('updatePluginDataAndNodes', () => {
  const mockSetSharedPluginData = jest.fn();
  const mockGetRelaunchData = jest.fn();
  const setValuesOnNodeSpy = jest.spyOn(setValuesOnNode, 'default');

  it('updatePluginDataAndNodes', async () => {
    mockGetRelaunchData.mockResolvedValue({ edit: 'edit' });
    mockGetNodeById.mockResolvedValue({ id: '5989:3' });

    const node = {
      id: '5989:3',
      name: 'Rectangle 1',
      setSharedPluginData: mockSetSharedPluginData,
    };

    const entries: BaseNode[] = [
      node as unknown as BaseNode,
    ];
    const values = {
      borderRadius: 'none',
      fill: 'red',
      spacing: 'delete',
    };
    const tokensMap = new Map([
      ['red', { value: '#ff0000', type: TokenTypes.COLOR } as SingleToken],
    ]);

    await updatePluginDataAndNodes({
      entries, values, tokensMap,
    });

    expect(mockSetSharedPluginData).toBeCalledWith('tokens', 'borderRadius', 'none');
    expect(mockSetSharedPluginData).toBeCalledWith('tokens', 'fill', '"red"');
    expect(mockSetSharedPluginData).toBeCalledWith('tokens', 'spacing', '');
    expect(setValuesOnNodeSpy).toBeCalledWith(
      {
        node,
        values: {
          fill: {
            type: 'color',
            value: '#ff0000',
          },
        },
        data: {
          borderRadius: 'none',
          fill: 'red',
          spacing: 'delete',
        },
      },
    );
  });
});
