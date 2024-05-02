import { useLicenseKey } from './useLicenseKey';
import { AddLicenseSource } from '@/app/store/models/userState';
import { LicenseStatus } from '@/constants/LicenseStatus';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { store } from '@/app/store';

describe('useLicenseKey', () => {
  const asyncMessageChannelMock = AsyncMessageChannel.ReactInstance.message as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set license status to ERROR when license validation fails', async () => {
    const { validateLicenseKey } = useLicenseKey();
    const params = {
      key: 'invalid-license-key',
      source: AddLicenseSource.INITAL_LOAD,
      userId: 'user-id',
      userName: 'user-name',
    };
    const error = 'Invalid license key';

    validateLicenseMock.mockResolvedValue({ error });

    await expect(validateLicenseKey(params)).rejects.toEqual(undefined);

    expect(store.getState().userState.licenseStatus).toEqual(LicenseStatus.ERROR);
    expect(store.getState().userState.licenseError).toEqual(error);
  });

  it('should set license status to VERIFIED and notify UI when license validation succeeds', async () => {
    const { validateLicenseKey } = useLicenseKey();
    const params = {
      key: 'valid-license-key',
      source: AddLicenseSource.UI,
      userId: 'user-id',
      userName: 'user-name',
    };
    const plan = 'basic';
    const clientEmail = 'test@example.com';
    const entitlements = ['entitlement1', 'entitlement2'];

    validateLicenseMock.mockResolvedValue({ plan, clientEmail, entitlements });

    await validateLicenseKey(params);

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'userState/setLicenseStatus',
      payload: LicenseStatus.VERIFIED,
    });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'userState/setLicenseError',
      payload: undefined,
    });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'userState/setLicenseDetails',
      payload: {
        plan,
        clientEmail,
        entitlements: [...new Set(entitlements)],
      },
    });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'userState/setLicenseKey',
      payload: params.key,
    });
    expect(asyncMessageChannelMock).toHaveBeenCalledWith({
      type: AsyncMessageTypes.SET_LICENSE_KEY,
      licenseKey: params.key,
    });
  });

  it('should set license status to NO_LICENSE when license key is not provided', async () => {
    const { initiateLicenseKey } = useLicenseKey();
    const params = {
      user: {
        figmaId: 'user-id',
        userName: 'user-name',
      },
      licenseKey: null,
      initialLoad: false,
    };

    await initiateLicenseKey(params);

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'userState/setLicenseStatus',
      payload: LicenseStatus.NO_LICENSE,
    });
  });

  it('should fetch license key and validate it when license key is not provided and initialLoad is true', async () => {
    const { initiateLicenseKey } = useLicenseKey();
    const params = {
      user: {
        figmaId: 'user-id',
        userName: 'user-name',
      },
      licenseKey: null,
      initialLoad: true,
    };
    const licenseKey = 'fetched-license-key';

    getLicenseKeyMock.mockResolvedValue({ key: licenseKey });

    await initiateLicenseKey(params);

    expect(getLicenseKeyMock).toHaveBeenCalledWith(params.user.figmaId);
    expect(validateLicenseMock).toHaveBeenCalledWith({
      key: licenseKey,
      source: AddLicenseSource.INITAL_LOAD,
      userId: params.user.figmaId,
      userName: params.user.userName,
    });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'userState/addLicenseKey',
      payload: {
        key: licenseKey,
        source: AddLicenseSource.INITAL_LOAD,
      },
    });
  });

  it('should validate license key and set license status to NO_LICENSE when license key is not provided and initialLoad is false', async () => {
    const { initiateLicenseKey } = useLicenseKey();
    const params = {
      user: {
        figmaId: 'user-id',
        userName: 'user-name',
      },
      licenseKey: null,
      initialLoad: false,
    };

    await initiateLicenseKey(params);

    expect(validateLicenseMock).not.toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'userState/setLicenseStatus',
      payload: LicenseStatus.NO_LICENSE,
    });
  });

  it('should validate license key and set license status to NO_LICENSE when license key is undefined', async () => {
    const { initiateLicenseKey } = useLicenseKey();
    const params = {
      user: {
        figmaId: 'user-id',
        userName: 'user-name',
      },
      licenseKey: undefined,
      initialLoad: false,
    };

    await initiateLicenseKey(params);

    expect(validateLicenseMock).not.toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'userState/setLicenseStatus',
      payload: LicenseStatus.NO_LICENSE,
    });
  });

  it('should validate license key and set license status to NO_LICENSE when license key is empty string', async () => {
    const { initiateLicenseKey } = useLicenseKey();
    const params = {
      user: {
        figmaId: 'user-id',
        userName: 'user-name',
      },
      licenseKey: '',
      initialLoad: false,
    };

    await initiateLicenseKey(params);

    expect(validateLicenseMock).not.toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'userState/setLicenseStatus',
      payload: LicenseStatus.NO_LICENSE,
    });
  });
});
