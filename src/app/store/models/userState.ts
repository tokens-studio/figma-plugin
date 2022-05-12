import { createModel } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import validateLicense from '@/utils/validateLicense';
import { notifyToUI } from '@/plugin/notifiers';
import removeLicense from '@/utils/removeLicense';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export enum AddLicenseSource {
  PLUGIN,
  INITAL_LOAD,
  UI,
}

export enum Entitlements {
  PRO = 'pro',
  BETA = 'beta',
}
export interface UserState {
  // this flag is used at initial plugin load
  // We only want to get the license key from the backend if there is not license key stored in local storage
  checkedLocalStorageForKey: boolean;
  userId: string | null;
  licenseKey: string | undefined;
  licenseError: string | undefined;
  userName: string;
  licenseDetails: LicenseDetails;
}

interface LicenseDetails {
  plan: string | undefined;
  clientEmail: string | undefined;
  entitlements: string[];
}

export const userState = createModel<RootModel>()({
  state: {
    checkedLocalStorageForKey: false,
    userId: null,
    licenseKey: undefined,
    licenseError: undefined,
    userName: '',
    licenseDetails: {
      plan: '',
      clientEmail: undefined,
      entitlements: [],
    },
  } as UserState,
  reducers: {
    setUserId(state, payload: string | null) {
      return {
        ...state,
        userId: payload,
      };
    },
    setUserName(state, payload: string) {
      return {
        ...state,
        userName: payload,
      };
    },
    setLicenseKey(state, payload: string | undefined) {
      return {
        ...state,
        licenseKey: payload,
      };
    },
    setCheckedLocalStorage(state, payload: boolean) {
      return {
        ...state,
        checkedLocalStorageForKey: payload,
      };
    },
    setLicenseError(state, payload: string | undefined) {
      return {
        ...state,
        licenseError: payload,
      };
    },
    setLicenseDetails(state, payload: LicenseDetails) {
      return {
        ...state,
        licenseDetails: payload,
      };
    },
  },
  effects: (dispatch) => ({
    addLicenseKey: async (payload: { key: string; source: AddLicenseSource }, rootState) => {
      const { userId } = rootState.userState;
      const { key, source } = payload;
      const {
        error, plan, email: clientEmail, entitlements,
      } = await validateLicense(key, userId);

      if (error) {
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

        if (source === AddLicenseSource.UI) {
          notifyToUI('License added succesfully!');
        }

        if (source !== AddLicenseSource.PLUGIN) {
          await AsyncMessageChannel.message({
            type: AsyncMessageTypes.SET_LICENSE_KEY,
            licenseKey: key,
          });
        }
      }
      dispatch.userState.setLicenseKey(key);
      if (source === AddLicenseSource.PLUGIN) {
        dispatch.userState.setCheckedLocalStorage(true);
      }
    },
    removeLicenseKey: async (payload, rootState) => {
      const { licenseKey, userId, licenseError } = rootState.userState;
      if (!licenseError && licenseKey) {
        const { error } = await removeLicense(licenseKey, userId);
        if (error) {
          notifyToUI('Error removing license, please contact support', { error: true });
        }
      }

      await AsyncMessageChannel.message({
        type: AsyncMessageTypes.SET_LICENSE_KEY,
        licenseKey: null,
      });

      dispatch.userState.setLicenseKey(undefined);
      dispatch.userState.setLicenseError(undefined);
      dispatch.userState.setLicenseDetails({
        plan: '',
        entitlements: [],
        clientEmail: '',
      });
    },
  }),
});
