import { createModel } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { notifyToUI } from '@/plugin/notifiers';
import removeLicense from '@/utils/removeLicense';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { LicenseStatus } from '@/constants/LicenseStatus';
import * as userStateReducers from './reducers/userState';
import type { LegacyOnlyLicense } from '@/utils/licenseApi';

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
  initialLoad: boolean;
  licenseKey: string | undefined;
  licenseError: string | undefined;
  licenseStatus: LicenseStatus;
  userName: string;
  licenseDetails: LicenseDetails;
  usedEmail: string | undefined;
  tokensStudioPAT: string | null;
  isFigmaEnterprise: boolean;
  // MIGRATION: set when the last validation only passed on the legacy license host after Studio rejected the key.
  // Drives the "Sign in to keep Pro" notice. Remove with the legacy host.
  legacyOnlyLicense: LegacyOnlyLicense | null;
}

interface LicenseDetails {
  plan: string | undefined;
  clientEmail: string | undefined;
  entitlements: string[];
}

export const userState = createModel<RootModel>()({
  state: {
    userId: null,
    initialLoad: false,
    licenseStatus: LicenseStatus.UNKNOWN,
    licenseKey: undefined,
    licenseError: undefined,
    userName: '',
    usedEmail: '',
    licenseDetails: {
      plan: '',
      clientEmail: undefined,
      entitlements: [],
    },
    tokensStudioPAT: null,
    isFigmaEnterprise: false,
    legacyOnlyLicense: null,
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
    setUsedEmail(state, payload: string | undefined) {
      return {
        ...state,
        usedEmail: payload,
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
    setInitialLoad(state, payload: boolean) {
      return {
        ...state,
        initialLoad: payload,
      };
    },
    setIsFigmaEnterprise(state, payload: boolean) {
      return {
        ...state,
        isFigmaEnterprise: payload,
      };
    },
    setLegacyOnlyLicense(state, payload: LegacyOnlyLicense | null) {
      return {
        ...state,
        legacyOnlyLicense: payload,
      };
    },
    ...userStateReducers,
  },
  effects: (dispatch) => ({
    removeLicenseKey: async (payload, rootState) => {
      const { licenseKey, userId, licenseError } = rootState.userState;

      if (licenseKey && !licenseError) {
        const { error } = await removeLicense(licenseKey, userId);
        if (error) {
          notifyToUI('Error removing license, please contact support@tokens.studio', { error: true });
        }
      }
      // clear license key related state
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SET_LICENSE_KEY,
        licenseKey: payload,
      });

      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SET_INITIAL_LOAD,
        initialLoad: true,
      });

      dispatch.userState.setInitialLoad(true);
      dispatch.userState.setLicenseKey(undefined);
      dispatch.userState.setLicenseError(undefined);
      dispatch.userState.setLegacyOnlyLicense(null);
      dispatch.userState.setLicenseDetails({
        plan: '',
        entitlements: [],
        clientEmail: '',
      });
    },
  }),
});
