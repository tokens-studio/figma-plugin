import type { Dispatch } from '@/app/store';
import { AddLicenseSource } from '@/app/store/models/userState';
import { useAuthStore } from '@/app/store/useAuthStore';
import { LicenseStatus } from '@/constants/LicenseStatus';
import type { StartupMessage } from '@/types/AsyncMessages';
import { addLicenseKey } from '@/utils/addLicenseKey';
import getLicenseKey from '@/utils/getLicenseKey';

export function addLicenseFactory(dispatch: Dispatch, params: StartupMessage) {
  return async () => {
    const { user } = params;
    let { licenseKey } = params;
    const { initialLoad } = params;

    // A Pro subscription on the signed-in account replaces the legacy license key. Users moved from a key to an
    // account still have the key stored, and once it is retired validating it reports "License key invalid" while
    // they have Pro. Forget the key instead, which also keeps it from being fetched again on the next launch.
    if (params.oauthTokens) {
      await useAuthStore.getState().sessionRestore;
      if (useAuthStore.getState().isPro) {
        if (licenseKey) {
          await dispatch.userState.clearLicenseKey();
        }
        dispatch.userState.setLicenseStatus(LicenseStatus.NO_LICENSE);
        return;
      }
    }

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
