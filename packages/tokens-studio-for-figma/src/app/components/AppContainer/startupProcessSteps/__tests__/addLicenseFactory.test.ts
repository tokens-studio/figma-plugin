import { createMockStore } from '../../../../../../tests/config/setupTest';
import type { StartupMessage } from '@/types/AsyncMessages';
import { addLicenseFactory } from '../addLicenseFactory';
import { AddLicenseSource } from '@/app/store/models/userState';
import * as getLicenseKeyModule from '@/utils/getLicenseKey';
import { LicenseStatus } from '@/constants/LicenseStatus';
import * as addLicenseKey from '@/utils/addLicenseKey';

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
});
