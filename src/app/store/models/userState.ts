import { createModel } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import validateLicense from '@/utils/validateLicense';
import { notifyToUI, postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';
import removeLicense from '@/utils/removeLicense';

export interface UserState {
  userId: string | null;
  licenseKey: string | undefined;
  licenseError: string | undefined;
}

export const userState = createModel<RootModel>()({
  state: {
    userId: null,
    licenseKey: undefined,
  } as UserState,
  reducers: {
    setUserId(state, payload: string) {
      return {
        ...state,
        userId: payload,
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
  },
  effects: (dispatch) => ({
    addLicenseKey: async (payload: { key: string; fromPlugin?: boolean }, rootState) => {
      const { userId } = rootState.userState;
      const { key, fromPlugin } = payload;

      const { error } = await validateLicense(key, userId);
      if (error) {
        dispatch.userState.setLicenseError(error);
        if (fromPlugin) {
          notifyToUI('License key invalid, please check your Settings', { error: true });
        }
      } else {
        // clear errors when license validation is succesfull
        dispatch.userState.setLicenseError(undefined);
        if (!fromPlugin) {
          notifyToUI('License added succesfully!');
        }
        postToFigma({
          type: MessageToPluginTypes.SET_LICENSE_KEY,
          licenseKey: key,
        });
      }
      dispatch.userState.setLicenseKey(key);
    },
    removeLicenseKey: async (payload, rootState) => {
      const { licenseKey, userId, licenseError } = rootState.userState;
      if (!licenseError && licenseKey) {
        const { error } = await removeLicense(licenseKey, userId);
        if (error) {
          notifyToUI('Error removing license, please contact support', { error: true });
        }
      }

      postToFigma({
        type: MessageToPluginTypes.SET_LICENSE_KEY,
        licenseKey: null,
      });
      dispatch.userState.setLicenseKey(undefined);
      dispatch.userState.setLicenseError(undefined);
    },
  }),
});
