import type { Dispatch } from '@/app/store';
import { AddLicenseSource } from '@/app/store/models/userState';
import { LicenseStatus } from '@/constants/LicenseStatus';
import type { StartupMessage } from '@/types/AsyncMessages';
import { addLicenseKey } from '@/utils/addLicenseKey';
import getLicenseKey from '@/utils/getLicenseKey';

export function addLicenseFactory(dispatch: Dispatch, params: StartupMessage) {
  return async () => {
    const { user } = params;
    let { licenseKey } = params;
    const { initialLoad } = params;

    if ((licenseKey === null || licenseKey === undefined) && (initialLoad && initialLoad.toString() !== 'true')) {
      const result = await getLicenseKey(user!.figmaId);
      if ('key' in result && result.key) {
        licenseKey = result.key;
      }
    }

    if (licenseKey) {
      await addLicenseKey(dispatch, {
        key: licenseKey,
        source: AddLicenseSource.INITAL_LOAD,
      }, {
        userId: user!.figmaId,
        userName: user!.name,
      });
    } else {
      dispatch.userState.setLicenseStatus(LicenseStatus.NO_LICENSE);
    }
  };
}
