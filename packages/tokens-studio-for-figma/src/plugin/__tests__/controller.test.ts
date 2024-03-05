import '../controller';
import { dispatchFigmaEvent } from '../../../tests/__mocks__/figmaMock';
import { defaultWorker } from '../Worker';
import * as sendSelectionChangeModule from '../sendSelectionChange';
import * as sendDocumentChangeModule from '../sendDocumentChange';

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

  it('should handle document change event', () => {
    const sendDocumentChangeSpy = jest.spyOn(sendDocumentChangeModule, 'sendDocumentChange');
    sendDocumentChangeSpy.mockImplementationOnce(async () => {});
    dispatchFigmaEvent('documentchange');
    expect(sendDocumentChangeSpy).toBeCalledTimes(1);
  });
});
