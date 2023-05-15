import * as Sentry from '@sentry/react';
import { mockFetch } from '../../tests/__mocks__/fetchMock';
import getLicenseKey from './getLicenseKey';

// Hide errors unless they are expected
jest.spyOn(console, 'error').mockImplementation(() => { });

describe('getLicenseKey', () => {
  const sentrySpy = jest.spyOn(Sentry, 'captureException');
  it('should call Sentry exception', async () => {
    mockFetch.mockImplementationOnce(() => Promise.reject());
    await getLicenseKey('jan');
    expect(sentrySpy).toBeCalledTimes(1);
  });
});
