import { createMockStore } from '../../../../../../tests/config/setupTest';
import type { StartupMessage } from '@/types/AsyncMessages';
import { addLicenseFactory } from '../addLicenseFactory';
import { AddLicenseSource } from '@/app/store/models/userState';
import * as getLicenseKeyModule from '@/utils/getLicenseKey';
import { LicenseStatus } from '@/constants/LicenseStatus';
import * as addLicenseKey from '@/utils/addLicenseKey';
import { useAuthStore } from '@/app/store/useAuthStore';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import type { OAuthTokens } from '@/types/oauth';
import * as removeLicenseModule from '@/utils/removeLicense';

describe('addLicenseFactory', () => {
  const getLicenseKeySpy = jest.spyOn(getLicenseKeyModule, 'default');

  it('should set the local license key if available', async () => {
    const mockStore = createMockStore({});
    const mockParams = {
      user: { figmaId: 'figma:1234' },
      licenseKey: 'FIGMA-TOKENS',
    } as unknown as StartupMessage;

    const addLicenseKeySpy = jest.spyOn(addLicenseKey, 'addLicenseKey');
    addLicenseKeySpy.mockResolvedValueOnce();

    const fn = addLicenseFactory(mockStore.dispatch, mockParams);
    await fn();

    expect(addLicenseKeySpy).toBeCalledTimes(1);
    expect(addLicenseKeySpy).toBeCalledWith(mockStore.dispatch, {
      key: 'FIGMA-TOKENS',
      source: AddLicenseSource.INITAL_LOAD,
    }, {
      userId: 'figma:1234',
    });
    expect(getLicenseKeySpy).not.toBeCalled();
  });

  it('should set NO_LICENSE if none available', async () => {
    const mockStore = createMockStore({});
    const mockParams = {
      user: { figmaId: 'figma:1234' },
    } as unknown as StartupMessage;

    const addLicenseKeySpy = jest.spyOn(addLicenseKey, 'addLicenseKey');
    getLicenseKeySpy.mockResolvedValueOnce({
      error: 'No license found',
    });

    const fn = addLicenseFactory(mockStore.dispatch, mockParams);
    await fn();

    expect(addLicenseKeySpy).not.toBeCalled();
    expect(mockStore.getState().userState.licenseStatus).toEqual(LicenseStatus.NO_LICENSE);
  });

  it('should set the remote license', async () => {
    const mockStore = createMockStore({});
    const mockParams = {
      user: { figmaId: 'figma:1234' },
    } as unknown as StartupMessage;

    const addLicenseKeySpy = jest.spyOn(addLicenseKey, 'addLicenseKey');
    getLicenseKeySpy.mockResolvedValueOnce({
      key: 'FIGMA-TOKENS',
    });

    const fn = addLicenseFactory(mockStore.dispatch, mockParams);
    await fn();

    expect(addLicenseKeySpy).toBeCalledTimes(0);
  });

  describe('with a restored Tokens Studio session', () => {
    const oauthTokens = { accessToken: 'token' } as OAuthTokens;
    const messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message');

    beforeEach(() => {
      messageSpy.mockReset();
      messageSpy.mockResolvedValue(undefined as any);
      useAuthStore.setState({ isPro: false, sessionRestore: null });
    });

    afterAll(() => {
      useAuthStore.setState({ isPro: false, sessionRestore: null });
    });

    it('forgets the legacy key instead of validating it when the account has Pro', async () => {
      const mockStore = createMockStore({
        userState: { licenseKey: 'FIGMA-TOKENS', licenseError: 'License key invalid' },
      });
      const mockParams = {
        user: { figmaId: 'figma:1234' },
        licenseKey: 'FIGMA-TOKENS',
        oauthTokens,
      } as unknown as StartupMessage;

      // The account is only known once the session restore settles.
      let finishRestore!: () => void;
      const sessionRestore = new Promise<void>((resolve) => { finishRestore = resolve; });
      useAuthStore.setState({ sessionRestore });

      const addLicenseKeySpy = jest.spyOn(addLicenseKey, 'addLicenseKey');
      const removeLicenseSpy = jest.spyOn(removeLicenseModule, 'default');
      const done = addLicenseFactory(mockStore.dispatch, mockParams)();
      useAuthStore.setState({ isPro: true });
      finishRestore();
      await done;

      expect(addLicenseKeySpy).not.toBeCalled();
      expect(getLicenseKeySpy).not.toBeCalled();
      // The key is only forgotten here, not released on the license server.
      expect(removeLicenseSpy).not.toBeCalled();
      const { userState } = mockStore.getState();
      expect(userState.licenseKey).toBeUndefined();
      expect(userState.licenseError).toBeUndefined();
      expect(userState.initialLoad).toBe(true);
      expect(userState.licenseStatus).toEqual(LicenseStatus.NO_LICENSE);
      expect(messageSpy).toBeCalledWith({ type: AsyncMessageTypes.SET_LICENSE_KEY, licenseKey: null });
      expect(messageSpy).toBeCalledWith({ type: AsyncMessageTypes.SET_INITIAL_LOAD, initialLoad: true });
    });

    it('does not fetch a remote key when the account has Pro', async () => {
      const mockStore = createMockStore({});
      const mockParams = {
        user: { figmaId: 'figma:1234' },
        // Without Pro, this value makes startup fetch the user's key from the license server.
        initialLoad: 'false',
        oauthTokens,
      } as unknown as StartupMessage;
      useAuthStore.setState({ isPro: true, sessionRestore: Promise.resolve() });

      const addLicenseKeySpy = jest.spyOn(addLicenseKey, 'addLicenseKey');
      await addLicenseFactory(mockStore.dispatch, mockParams)();

      expect(getLicenseKeySpy).not.toBeCalled();
      expect(addLicenseKeySpy).not.toBeCalled();
      expect(messageSpy).not.toBeCalled();
      expect(mockStore.getState().userState.licenseStatus).toEqual(LicenseStatus.NO_LICENSE);
    });

    it('still validates the key when the account has no Pro subscription', async () => {
      const mockStore = createMockStore({});
      const mockParams = {
        user: { figmaId: 'figma:1234' },
        licenseKey: 'FIGMA-TOKENS',
        oauthTokens,
      } as unknown as StartupMessage;
      useAuthStore.setState({ isPro: false, sessionRestore: Promise.resolve() });

      const addLicenseKeySpy = jest.spyOn(addLicenseKey, 'addLicenseKey');
      addLicenseKeySpy.mockResolvedValueOnce();
      await addLicenseFactory(mockStore.dispatch, mockParams)();

      expect(addLicenseKeySpy).toBeCalledTimes(1);
    });
  });
});
