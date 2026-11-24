import { AddLicenseSource } from '@/app/store/models/userState';
import { addLicenseKey } from './addLicenseKey';
import validateLicense from './validateLicense';

jest.mock('./validateLicense', () => jest.fn());
jest.mock('@/plugin/notifiers', () => ({ notifyToUI: jest.fn() }));
jest.mock('@/AsyncMessageChannel', () => ({ AsyncMessageChannel: { ReactInstance: { message: jest.fn() } } }));

const validateLicenseMock = validateLicense as jest.MockedFunction<typeof validateLicense>;

const makeDispatch = () => ({
  userState: {
    setLicenseStatus: jest.fn(),
    setLicenseError: jest.fn(),
    setLicenseDetails: jest.fn(),
    setLicenseKey: jest.fn(),
    setLegacyOnlyLicense: jest.fn(),
  },
});

const run = (dispatch: ReturnType<typeof makeDispatch>) => addLicenseKey(
  dispatch as any,
  { key: 'a-key', source: AddLicenseSource.INITAL_LOAD },
  { userId: 'jan' },
);

describe('addLicenseKey', () => {
  it('records a key that only validated on the legacy host', async () => {
    validateLicenseMock.mockResolvedValueOnce({ plan: 'pro', legacyOnly: { primaryStatus: 404, primaryReason: 'status' } });
    const dispatch = makeDispatch();

    await run(dispatch);

    expect(dispatch.userState.setLegacyOnlyLicense).toHaveBeenCalledWith({ primaryStatus: 404, primaryReason: 'status' });
  });

  it('clears it when the key validated on Studio', async () => {
    validateLicenseMock.mockResolvedValueOnce({ plan: 'pro' });
    const dispatch = makeDispatch();

    await run(dispatch);

    expect(dispatch.userState.setLegacyOnlyLicense).toHaveBeenCalledWith(null);
  });

  it('clears it when the key did not validate at all', async () => {
    validateLicenseMock.mockResolvedValueOnce({ error: 'No license key found' });
    const dispatch = makeDispatch();

    await run(dispatch);

    expect(dispatch.userState.setLegacyOnlyLicense).toHaveBeenCalledWith(null);
  });
});
