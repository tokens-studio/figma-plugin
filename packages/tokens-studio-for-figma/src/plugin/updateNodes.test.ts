import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { MessageFromPluginTypes } from '@/types/messages';
import { mockUiPostMessage } from '../../tests/__mocks__/figmaMock';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import * as setValuesOnNodeModule from './setValuesOnNode';
import { updateNodes } from './updateNodes';

describe('updateNodes', () => {
  it('reports completion only after node application finishes', async () => {
    defaultTokenValueRetriever.initiate({ tokens: [] });
    let finishApply: () => void = () => {};
    const applying = new Promise<void>((resolve) => {
      finishApply = resolve;
    });
    let signalStarted: () => void = () => {};
    const started = new Promise<void>((resolve) => {
      signalStarted = resolve;
    });
    const setter = jest.spyOn(setValuesOnNodeModule, 'default').mockImplementationOnce(async () => {
      signalStarted();
      await applying;
    });

    const updating = updateNodes([{ id: '1:1', node: { id: '1:1' } as BaseNode, tokens: {} }], '16');
    await started;
    expect(mockUiPostMessage).not.toHaveBeenCalledWith({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.PLUGIN_UPDATENODES,
    });

    finishApply();
    await updating;
    expect(mockUiPostMessage).toHaveBeenCalledWith({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.PLUGIN_UPDATENODES,
    });
    setter.mockRestore();
  });
});
