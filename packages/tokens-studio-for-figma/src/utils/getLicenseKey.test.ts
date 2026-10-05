import * as Sentry from '@sentry/react';
import { mockFetch } from '../../tests/__mocks__/fetchMock';
import { LICENSE_API_HOSTS } from './licenseApiUrl';
import getLicenseKey from './getLicenseKey';

const [PRIMARY, LEGACY] = LICENSE_API_HOSTS;

const json = (status: number, body: unknown) => Promise.resolve({ status, text: () => Promise.resolve(JSON.stringify(body)) });

describe('getLicenseKey', () => {
  const sentrySpy = jest.spyOn(Sentry, 'captureException');
  const sentryMessageSpy = jest.spyOn(Sentry, 'captureMessage');

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('should call Sentry when no host can be reached', async () => {
    mockFetch.mockImplementation(() => Promise.reject());

    const result = await getLicenseKey('jan');

    expect(result).toEqual({ error: 'Error fetching license' });
    expect(sentryMessageSpy).toBeCalledTimes(1);
  });

  it('should not call Sentry when the legacy host answers', async () => {
    mockFetch
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() => json(200, { key: 'a-license-key' }));

    const result = await getLicenseKey('jan');

    expect(result).toEqual({ key: 'a-license-key' });
    expect(mockFetch).toHaveBeenNthCalledWith(1, `${PRIMARY}/get-license?userId=jan`, expect.anything());
    expect(mockFetch).toHaveBeenNthCalledWith(2, `${LEGACY}/get-license?userId=jan`, expect.anything());
    expect(sentrySpy).not.toBeCalled();
    expect(sentryMessageSpy).not.toBeCalled();
  });

  it('should surface the last error message when neither host has the license', async () => {
    mockFetch
      .mockImplementationOnce(() => json(404, { message: 'Not found' }))
      .mockImplementationOnce(() => json(404, { message: 'No license key found' }));

    expect(await getLicenseKey('jan')).toEqual({ error: 'No license key found' });
    expect(sentryMessageSpy).not.toBeCalled();
  });
});
