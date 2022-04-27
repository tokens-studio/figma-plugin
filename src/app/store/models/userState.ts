import { createModel } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import validateLicense from '@/utils/validateLicense';

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
    setLicenseError(state, payload: string) {
      return {
        ...state,
        licenseError: payload,
      };
    },
  },
  effects: (dispatch) => ({
    setLicenseKey: async (payload, rootState) => {
      const { userId } = rootState.userState;

      const { error } = await validateLicense(payload, userId);
      if (error) {
        dispatch.userState.setLicenseError(error);
      } else {
        dispatch.userState.setLicenseKey(payload);
      }
    },
  }),
});
