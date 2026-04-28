import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';

export function saveTheme(dispatch: RematchDispatch<RootModel>) {
  return async (payload: any, rootState: any): Promise<void> => {
    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });

    await pushThemeToTokensStudioOAuth(payload, rootState, dispatch);
  };
}
