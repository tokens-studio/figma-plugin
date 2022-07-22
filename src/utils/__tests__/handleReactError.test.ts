import * as Sentry from '@sentry/react';
import { handleReactError } from '../error/handleReactError';

describe('handleReactError', () => {
  it('should work', () => {
    const sentrySpy = jest.spyOn(Sentry, 'captureException');
    const traceSpy = jest.spyOn(console, 'trace');
    const errorSpy = jest.spyOn(console, 'error');

    traceSpy.mockImplementationOnce(() => {});
    errorSpy.mockImplementationOnce(() => {});

    handleReactError(new Error('error'));

    expect(sentrySpy).toBeCalledTimes(1);
    expect(traceSpy).toBeCalledTimes(1);
    expect(errorSpy).toBeCalledTimes(1);
  });
});
