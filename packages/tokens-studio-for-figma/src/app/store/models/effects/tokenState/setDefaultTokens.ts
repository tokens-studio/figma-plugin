import type { RematchDispatch } from '@rematch/core';
import defaultJSON from '@/config/default.json';
import type { RootModel } from '@/types/RootModel';
import parseTokenValues from '@/utils/parseTokenValues';
import { SetTokenDataPayload } from '@/types/payloads';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export function setDefaultTokens(dispatch: RematchDispatch<RootModel>) {
  return (): void => {
    dispatch.tokenState.setTokenData({
      values: parseTokenValues(defaultJSON as unknown as SetTokenDataPayload['values']),
      themes: [],
      activeTheme: {},
      usedTokenSet: { core: TokenSetStatus.SOURCE, light: TokenSetStatus.ENABLED, theme: TokenSetStatus.ENABLED },
    });

    dispatch.tokenState.updateDocument({
      shouldUpdateNodes: false,
      updateRemote: false,
    });
  };
}
