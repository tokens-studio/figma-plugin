import type { RematchDispatch } from '@rematch/core';
import * as pjs from '../../../../../../package.json';
import defaultJSON from '@/config/default.json';
import type { RootModel } from '@/types/RootModel';
import type { TokenStore } from '@/types/tokens';
import parseTokenValues from '@/utils/parseTokenValues';
import { SetTokenDataPayload } from '@/types/payloads';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

const defaultTokens: TokenStore = {
  version: pjs.plugin_version,
  themes: [],
  activeTheme: {},
  updatedAt: new Date().toString(),
  // @TODO this may not be correct
  values: parseTokenValues(defaultJSON as unknown as SetTokenDataPayload['values']),
};

export function setDefaultTokens(dispatch: RematchDispatch<RootModel>) {
  return (): void => {
    dispatch.tokenState.setTokenData({
      values: defaultTokens.values,
      themes: defaultTokens.themes,
      activeTheme: defaultTokens.activeTheme,
      usedTokenSet: { core: TokenSetStatus.SOURCE, light: TokenSetStatus.ENABLED, theme: TokenSetStatus.ENABLED },
    });
  };
}
