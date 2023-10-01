import type { Dispatch } from '@/app/store';
import { AddLicenseSource } from '@/app/store/models/userState';
import { LicenseStatus } from '@/constants/LicenseStatus';
import type { StartupMessage } from '@/types/AsyncMessages';
import getLicenseKey from '@/utils/getLicenseKey';

export function addLicenseFactory(dispatch: Dispatch, params: StartupMessage) {
  return async () => {
    const { user } = params;
    let { licenseKey } = params;
    if (!licenseKey) {
      const result = await getLicenseKey(user!.figmaId);
      if ('key' in result && result.key) {
        licenseKey = result.key;
      }
    }

    if (licenseKey) {
      await dispatch.userState.addLicenseKey({
        key: licenseKey,
        source: AddLicenseSource.INITAL_LOAD,
      });
    } else {
      dispatch.userState.setLicenseStatus(LicenseStatus.NO_LICENSE);
    }
  };
}
