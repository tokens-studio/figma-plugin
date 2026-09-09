import { mockFetch } from '../../tests/__mocks__/fetchMock';
import { LICENSE_API_HOSTS } from './licenseApiUrl';
import validateLicense from './validateLicense';

const [PRIMARY, LEGACY] = LICENSE_API_HOSTS;

const PRO = { plan: 'pro', entitlements: ['pro'], email: 'pro@example.test' };
const json = (status: number, body: unknown) => Promise.resolve({ status, text: () => Promise.resolve(JSON.stringify(body)) });
const urlOf = (call: number) => mockFetch.mock.calls[call - 1][0] as string;

describe('validateLicense', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('validates against the primary host and returns the licence details', async () => {
    mockFetch.mockImplementationOnce(() => json(200, PRO));

    expect(await validateLicense('a-key', 'jan', 'Jan Six')).toEqual(PRO);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(urlOf(1)).toEqual(`${PRIMARY}/validate-license?licenseKey=a-key&userId=jan&userName=Jan Six`);
  });

  it('omits userName from the query when there is none', async () => {
    mockFetch.mockImplementationOnce(() => json(200, PRO));

    await validateLicense('a-key', 'jan');

    expect(urlOf(1)).toEqual(`${PRIMARY}/validate-license?licenseKey=a-key&userId=jan`);
  });

  it('falls back to the legacy host when the primary has no record', async () => {
    mockFetch
      .mockImplementationOnce(() => json(404, { message: 'License not found' }))
      .mockImplementationOnce(() => json(200, PRO));

    expect(await validateLicense('a-key', 'jan')).toEqual(PRO);
    expect(urlOf(2)).toEqual(`${LEGACY}/validate-license?licenseKey=a-key&userId=jan`);
  });

  // A partially imported record answers 200 with a valid-looking but empty
  // payload. addLicenseKey would treat that as VERIFIED and drop a paying user
  // to the free tier, so it has to count as a miss.
  it.each([
    ['no plan and no entitlements', { plan: null, entitlements: [] }],
    ['an empty object', {}],
    ['a null body', null],
  ])('falls back when the primary answers 200 with %s', async (_label, incomplete) => {
    mockFetch
      .mockImplementationOnce(() => json(200, incomplete))
      .mockImplementationOnce(() => json(200, PRO));

    expect(await validateLicense('a-key', 'jan')).toEqual(PRO);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['a plan but no entitlements', { plan: 'pro', entitlements: [] }],
    ['entitlements but no plan', { plan: null, entitlements: ['beta'] }],
  ])('accepts a 200 carrying %s', async (_label, complete) => {
    mockFetch.mockImplementationOnce(() => json(200, complete));

    expect(await validateLicense('a-key', 'jan')).toEqual(complete);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('surfaces the last host error message when neither host validates', async () => {
    mockFetch
      .mockImplementationOnce(() => json(404, { message: 'License not found' }))
      .mockImplementationOnce(() => json(404, { message: 'No license key found' }));

    expect(await validateLicense('a-key', 'jan')).toEqual({ error: 'No license key found' });
  });

  it('falls back to a generic message when no host produced one', async () => {
    mockFetch.mockImplementation(() => Promise.reject());

    expect(await validateLicense('a-key', 'jan')).toEqual({ error: 'Error validating license' });
  });
});
