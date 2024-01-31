import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';

export function setEmptyTokens(dispatch: RematchDispatch<RootModel>) {
  return (): void => {
    dispatch.tokenState.setTokenData({
      values: [],
      themes: [],
      activeTheme: {},
    });
  };
}
