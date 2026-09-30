import { TokenTypes } from '@/constants/TokenTypes';
import { mockGetNodeById, mockUiPostMessage } from '../../tests/__mocks__/figmaMock';
import * as setValuesOnNode from './setValuesOnNode';
import { updatePluginDataAndNodes } from './updatePluginDataAndNodes';
import { SingleToken } from '@/types/tokens';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { MessageFromPluginTypes } from '@/types/messages';

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

  it('waits for node application before reporting completion', async () => {
    let finishApply: () => void = () => {};
    const applying = new Promise<void>((resolve) => { finishApply = resolve; });
    let signalStarted: () => void = () => {};
    const started = new Promise<void>((resolve) => { signalStarted = resolve; });
    setValuesOnNodeSpy.mockImplementationOnce(async () => {
      signalStarted();
      await applying;
    });
    const node = { id: '1:1', setSharedPluginData: jest.fn() } as unknown as BaseNode;

    const updating = updatePluginDataAndNodes({
      entries: [node],
      values: {},
      tokensMap: new Map(),
    });
    await started;
    expect(mockUiPostMessage).not.toHaveBeenCalledWith({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
    });

    finishApply();
    await updating;
    expect(mockUiPostMessage).toHaveBeenCalledWith({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
    });
  });
});
