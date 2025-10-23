import '../controller';
import { dispatchFigmaEvent } from '../../../tests/__mocks__/figmaMock';
import { defaultWorker } from '../Worker';
import * as sendSelectionChangeModule from '../sendSelectionChange';

describe('controller', () => {
  it('should stop the worker on close', () => {
    const defaultWorkerStopSpy = jest.spyOn(defaultWorker, 'stop');
    dispatchFigmaEvent('close');
    expect(defaultWorkerStopSpy).toBeCalledTimes(1);
  });

  it('should send selection change', () => {
    const sendSelectionChangeSpy = jest.spyOn(sendSelectionChangeModule, 'sendSelectionChange');
    sendSelectionChangeSpy.mockImplementationOnce(async () => null);
    dispatchFigmaEvent('selectionchange');
    expect(sendSelectionChangeSpy).toBeCalledTimes(1);
  });

  it('should handle current page change event', () => {
    const sendSelectionChangeSpy = jest.spyOn(sendSelectionChangeModule, 'sendSelectionChange');
    sendSelectionChangeSpy.mockImplementationOnce(async () => null);
    dispatchFigmaEvent('currentpagechange');
    expect(sendSelectionChangeSpy).toBeCalledTimes(1);
  });
});
