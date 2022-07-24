import * as Sentry from '@sentry/react';
import { handleReactError } from '../error/handleReactError';

describe('handleReactError', () => {
  it('should work', () => {
    const sentrySpy = jest.spyOn(Sentry, 'captureException');
    const errorSpy = jest.spyOn(console, 'error');

    errorSpy.mockImplementationOnce(() => {});

    handleReactError(new Error('error'));

    expect(sentrySpy).toBeCalledTimes(1);
    expect(errorSpy).toBeCalledTimes(1);
  });
});
