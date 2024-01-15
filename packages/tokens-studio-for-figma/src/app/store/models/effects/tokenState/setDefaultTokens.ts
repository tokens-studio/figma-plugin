import type { RematchDispatch } from '@rematch/core';
import * as pjs from '../../../../../../package.json';
import defaultJSON from '@/config/default.json';
import type { RootModel } from '@/types/RootModel';
import type { TokenStore } from '@/types/tokens';
import parseTokenValues from '@/utils/parseTokenValues';
import { SetTokenDataPayload } from '@/types/payloads';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export function setDefaultTokens(dispatch: RematchDispatch<RootModel>) {
  return (): void => {
    console.log('setting default tokens');
    dispatch.tokenState.setTokenData({
      values: parseTokenValues(defaultJSON as unknown as SetTokenDataPayload['values']),
      themes: [],
      activeTheme: {},
      usedTokenSet: { core: TokenSetStatus.SOURCE, light: TokenSetStatus.ENABLED, theme: TokenSetStatus.ENABLED },
    });
  };
}
