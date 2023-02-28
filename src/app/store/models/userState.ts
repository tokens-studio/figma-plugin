import { createModel } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import validateLicense from '@/utils/validateLicense';
import { notifyToUI } from '@/plugin/notifiers';
import removeLicense from '@/utils/removeLicense';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { LicenseStatus } from '@/constants/LicenseStatus';
import * as userStateReducers from './reducers/userState';

export enum AddLicenseSource {
  INITAL_LOAD,
  UI,
}

export enum Entitlements {
  PRO = 'pro',
  BETA = 'beta',
}
export interface UserState {
  userId: string | null;
  licenseKey: string | undefined;
  licenseError: string | undefined;
  licenseStatus: LicenseStatus;
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
    userId: null,
    licenseStatus: LicenseStatus.UNKNOWN,
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
    ...userStateReducers,
  },
  effects: (dispatch) => ({
    addLicenseKey: async (payload: { key: string; source: AddLicenseSource }, rootState) => {
      dispatch.userState.setLicenseStatus(LicenseStatus.VERIFYING);

      const { userId, userName } = rootState.userState;
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
    },
    removeLicenseKey: async (payload, rootState) => {
      const { licenseKey, userId, licenseError } = rootState.userState;

      if (licenseKey && !licenseError) {
        const { error } = await removeLicense(licenseKey, userId);
        if (error) {
          notifyToUI('Error removing license, please contact support', { error: true });
        }
      }
      // clear license key related state
      AsyncMessageChannel.ReactInstance.message({
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
