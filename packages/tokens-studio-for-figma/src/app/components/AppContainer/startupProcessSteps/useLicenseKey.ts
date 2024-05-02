import { useDispatch } from 'react-redux';
import { LicenseStatus } from '@/constants/LicenseStatus';
import { AddLicenseSource } from '@/app/store/models/userState';
import validateLicense from '@/utils/validateLicense';
import { notifyToUI } from '@/plugin/notifiers';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import getLicenseKey from '@/utils/getLicenseKey';

export function useLicenseKey() {
  const dispatch = useDispatch();

  const validateLicenseKey = async ({
    key, source, userId, userName,
  }: { key: string, source: AddLicenseSource, userId: string, userName?: string }) => {
    dispatch.userState.setLicenseStatus(LicenseStatus.VERIFYING);

    const {
      error, plan, email: clientEmail, entitlements,
    } = await validateLicense(key, userId, userName);

    if (error) {
      dispatch.userState.setLicenseStatus(LicenseStatus.ERROR);
      dispatch.userState.setLicenseError(error);
      if (source === AddLicenseSource.INITAL_LOAD) {
        notifyToUI('License key invalid, please check your Settings', { error: true });
      }
      Promise.reject();
    } else {
    // clear errors when license validation is succesfull
      dispatch.userState.setLicenseError(undefined);
      dispatch.userState.setLicenseDetails({
        plan,
        clientEmail,
        entitlements: [...new Set(entitlements)],
      });
      dispatch.userState.setLicenseStatus(LicenseStatus.VERIFIED);

      if (source === AddLicenseSource.UI) {
        notifyToUI('License added succesfully!');
        dispatch.userState.setLicenseKey(key);
      }

      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SET_LICENSE_KEY,
        licenseKey: key,
      });
    }
    dispatch.userState.setLicenseKey(key);
    Promise.resolve();
  };

  const initiateLicenseKey = async (params) => {
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
      console.log('Adding license key', licenseKey);
      await validateLicenseKey({
        key: licenseKey,
        source: AddLicenseSource.INITAL_LOAD,
        userId: user!.figmaId,
        userName: user!.userName,
      });
      await dispatch.userState.addLicenseKey({
        key: licenseKey,
        source: AddLicenseSource.INITAL_LOAD,
      });
    } else {
      dispatch.userState.setLicenseStatus(LicenseStatus.NO_LICENSE);
    }
  };

  return { validateLicenseKey, initiateLicenseKey };
}
