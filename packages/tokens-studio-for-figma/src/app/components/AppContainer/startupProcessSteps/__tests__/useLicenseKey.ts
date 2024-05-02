import { act } from '@testing-library/react-hooks';
import { AllTheProviders, createMockStore, renderHook } from '../../../../../../tests/config/setupTest';
import type { StartupMessage } from '@/types/AsyncMessages';
import { addLicenseFactory } from '../addLicenseFactory';
import { AddLicenseSource } from '@/app/store/models/userState';
import * as getLicenseKeyModule from '@/utils/getLicenseKey';
import { LicenseStatus } from '@/constants/LicenseStatus';
import { useLicenseKey } from '../useLicenseKey';

describe('useLicenseKey', () => {
  const getLicenseKeySpy = jest.spyOn(getLicenseKeyModule, 'default');

  it('should set the local license key if available', async () => {
    const { result } = renderHook(() => useLicenseKey(), {
      wrapper: AllTheProviders,
    });

    const mockStore = createMockStore({});
    const mockParams = {
      user: { figmaId: 'figma:1234' },
      licenseKey: 'FIGMA-TOKENS',
    } as unknown as StartupMessage;

    await act(async () => result.current.initiateLicenseKey(mockParams));

    const addLicenseKeySpy = jest.spyOn(validateLicenseKey, 'addLicenseKey');
    addLicenseKeySpy.mockResolvedValueOnce();

    expect(addLicenseKeySpy).toBeCalledTimes(1);
    expect(addLicenseKeySpy).toBeCalledWith({
      key: 'FIGMA-TOKENS',
      source: AddLicenseSource.INITAL_LOAD,
    });
    expect(getLicenseKeySpy).not.toBeCalled();
  });

  it('should set NO_LICENSE if none available', async () => {
    const mockStore = createMockStore({});
    const mockParams = {
      user: { figmaId: 'figma:1234' },
    } as unknown as StartupMessage;

    const addLicenseKeySpy = jest.spyOn(mockStore.dispatch.userState, 'addLicenseKey');
    getLicenseKeySpy.mockResolvedValueOnce({
      error: 'No license found',
    });

    await initializeLicenseKey(mockParams);

    expect(addLicenseKeySpy).not.toBeCalled();
    expect(mockStore.getState().userState.licenseStatus).toEqual(LicenseStatus.NO_LICENSE);
  });

  it('should set the remote license', async () => {
    const mockStore = createMockStore({});
    const mockParams = {
      user: { figmaId: 'figma:1234' },
    } as unknown as StartupMessage;

    const addLicenseKeySpy = jest.spyOn(mockStore.dispatch.userState, 'addLicenseKey');
    getLicenseKeySpy.mockResolvedValueOnce({
      key: 'FIGMA-TOKENS',
    });

    const fn = addLicenseFactory(mockStore.dispatch, mockParams);
    await fn();

    expect(addLicenseKeySpy).toBeCalledTimes(0);
  });
});
