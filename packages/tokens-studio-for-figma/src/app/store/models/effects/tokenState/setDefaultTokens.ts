import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import parseTokenValues from '@/utils/parseTokenValues';
import { SetTokenDataPayload } from '@/types/payloads';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { presets } from '@/constants/presets';

export function setDefaultTokens(dispatch: RematchDispatch<RootModel>) {
  return (presetId: string): void => {
    const foundJSON = presets.find((preset) => preset.id === presetId)!.json;
    dispatch.tokenState.setTokenData({
      // We know the preset exists, so we can safely use the non-null assertion operator here
      values: parseTokenValues(foundJSON as unknown as SetTokenDataPayload['values']),
      themes: [],
      activeTheme: {},
      usedTokenSet: { core: TokenSetStatus.SOURCE, light: TokenSetStatus.ENABLED, theme: TokenSetStatus.ENABLED },
    });
  };
}
