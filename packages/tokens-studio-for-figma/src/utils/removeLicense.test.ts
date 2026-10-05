import { mockFetch } from '../../tests/__mocks__/fetchMock';
import { LICENSE_API_HOSTS } from './licenseApiUrl';
import removeLicense from './removeLicense';

const [PRIMARY, LEGACY] = LICENSE_API_HOSTS;

const json = (status: number, body: unknown) => Promise.resolve({ status, text: () => Promise.resolve(JSON.stringify(body)) });

describe('removeLicense', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('detaches on the primary host and returns the key', async () => {
    mockFetch.mockImplementationOnce(() => json(200, 'detached-key'));

    expect(await removeLicense('a-license-key', 'jan')).toEqual({ key: 'detached-key' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${PRIMARY}/detach-license`, expect.objectContaining({
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: 'a-license-key', userId: 'jan' }),
    }));
  });

  it('falls back to the legacy host, carrying the request through unchanged', async () => {
    mockFetch
      .mockImplementationOnce(() => json(500, { message: 'boom' }))
      .mockImplementationOnce(() => json(200, 'detached-key'));

    expect(await removeLicense('a-license-key', 'jan')).toEqual({ key: 'detached-key' });
    expect(mockFetch).toHaveBeenNthCalledWith(2, `${LEGACY}/detach-license`, expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ licenseKey: 'a-license-key', userId: 'jan' }),
    }));
  });

  it('surfaces the last error message when neither host detaches', async () => {
    mockFetch
      .mockImplementationOnce(() => json(500, { message: 'primary is unhappy' }))
      .mockImplementationOnce(() => json(500, { message: 'Detach error message' }));

    expect(await removeLicense('a-license-key', 'jan')).toEqual({ error: 'Detach error message' });
  });

  it('falls back to a generic message when no host produced one', async () => {
    mockFetch.mockImplementation(() => Promise.reject());

    expect(await removeLicense('a-license-key', 'jan')).toEqual({ error: 'Error removing license' });
  });
});
