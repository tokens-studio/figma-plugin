import { Dispatch } from '@/app/store';
import { AddLicenseSource } from '@/app/store/models/userState';
import { LicenseStatus } from '@/constants/LicenseStatus';
import validateLicense from './validateLicense';
import { notifyToUI } from '@/plugin/notifiers';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export async function addLicenseKey(dispatch: Dispatch, payload: { key: string; source: AddLicenseSource }, user: {
  userId: string | null;
  userName?: string;
}) {
  dispatch.userState.setLicenseStatus(LicenseStatus.VERIFYING);

  const { userId, userName } = user;
  const { key, source } = payload;

  const {
    error, plan, email: clientEmail, entitlements,
  } = await validateLicense(key, userId, userName);

  if (error) {
    dispatch.userState.setLicenseStatus(LicenseStatus.ERROR);
    dispatch.userState.setLicenseError(error);
    if (source === AddLicenseSource.INITAL_LOAD) {
      notifyToUI('License key invalid, please check your Settings', { error: true });
    }
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
}
