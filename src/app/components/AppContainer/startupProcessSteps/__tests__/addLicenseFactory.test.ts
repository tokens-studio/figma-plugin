import { createMockStore } from '../../../../../../tests/config/setupTest';
import type { StartupMessage } from '@/types/AsyncMessages';
import { addLicenseFactory } from '../addLicenseFactory';
import { AddLicenseSource } from '@/app/store/models/userState';
import * as getLicenseKeyModule from '@/utils/getLicenseKey';
import { LicenseStatus } from '@/constants/LicenseStatus';

describe('addLicenseFactory', () => {
  const getLicenseKeySpy = jest.spyOn(getLicenseKeyModule, 'default');

  it('should set the local license key if available', async () => {
    const mockStore = createMockStore({});
    const mockParams = {
      user: { figmaId: 'figma:1234' },
      licenseKey: 'FIGMA-TOKENS',
    } as unknown as StartupMessage;

    const addLicenseKeySpy = jest.spyOn(mockStore.dispatch.userState, 'addLicenseKey');
    addLicenseKeySpy.mockResolvedValueOnce();

    const fn = addLicenseFactory(mockStore.dispatch, mockParams);
    await fn();

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

    const fn = addLicenseFactory(mockStore.dispatch, mockParams);
    await fn();

    expect(addLicenseKeySpy).not.toBeCalled();
    expect(mockStore.getState().userState.licenseStatus).toEqual(LicenseStatus.NO_LICENSE);
  });

  it('should set the remote license if available', async () => {
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

    expect(addLicenseKeySpy).toBeCalledTimes(1);
    expect(addLicenseKeySpy).toBeCalledWith({
      key: 'FIGMA-TOKENS',
      source: AddLicenseSource.INITAL_LOAD,
    });
  });
});
