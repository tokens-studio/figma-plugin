import compact from 'just-compact';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { SetTokenDataPayload } from '@/types/payloads';
import parseTokenValues from '@/utils/parseTokenValues';
import type { TokenState } from '../../tokenState';
import removeIdPropertyFromTokens from '@/utils/removeIdPropertyFromTokens';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { TokenStore } from '@/types/tokens';
import { checkStorageSize } from '@/utils/checkStorageSize';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

export function setTokenData(state: TokenState, payload: SetTokenDataPayload): TokenState {
  if (payload.values.length === 0) {
    return state;
  }
  let values;
  if (!Array.isArray) {
    values = payload.values as TokenStore['values'];
  } else {
    values = parseTokenValues(payload.values);
  }

  const tokensSize = payload.values ? checkStorageSize(payload.values) : state.tokensSize;
  const themesSize = payload.themes ? checkStorageSize(payload.themes) : state.themesSize;

  const allAvailableTokenSets = Object.keys(values);
  const usedTokenSets = Object.fromEntries(
    allAvailableTokenSets.map((tokenSet) => [tokenSet, payload.usedTokenSet?.[tokenSet] ?? TokenSetStatus.DISABLED]),
  );
  let newActiveTheme = payload.activeTheme;
  Object.entries(newActiveTheme ?? {}).forEach(([group, activeTheme]) => {
    if (!payload.themes?.find((t) => t.id === activeTheme) && newActiveTheme) {
      delete newActiveTheme[group];
    }
  });

  // Auto-enable the first theme if no active theme is set and themes are available
  const hasActiveTheme = newActiveTheme && Object.keys(newActiveTheme).length > 0;
  const hasThemes = payload.themes && payload.themes.length > 0;
  let finalUsedTokenSets = Array.isArray(payload.values) ? { global: TokenSetStatus.ENABLED } : usedTokenSets;

  if (!hasActiveTheme && hasThemes) {
    const firstTheme = payload.themes![0];
    const groupKey = firstTheme.group || INTERNAL_THEMES_NO_GROUP;
    newActiveTheme = { [groupKey]: firstTheme.id };

    // Update usedTokenSet based on the first theme's selectedTokenSets
    const selectedTokenSets: Record<string, TokenSetStatus> = {};
    Object.entries(firstTheme.selectedTokenSets).forEach(([tokenSet, status]) => {
      if (status !== TokenSetStatus.DISABLED) {
        selectedTokenSets[tokenSet] = status;
      }
    });

    finalUsedTokenSets = Object.fromEntries(
      allAvailableTokenSets.map((tokenSet) => (
        [tokenSet, selectedTokenSets?.[tokenSet] ?? TokenSetStatus.DISABLED]
      )),
    );
  }

  const tokenValues = Array.isArray(payload.values) ? payload.values : removeIdPropertyFromTokens(payload.values);

  // When the remote data has changed, we will update the last synced state
  const lastSyncedState = payload.hasChangedRemote ? JSON.stringify(compact([tokenValues, payload.themes, TokenFormat.format]), null, 2) : state.lastSyncedState;

  // @README (1) for the sake of normalization we will set the DISABLED status for all available token sets
  // this way we can always be certain the status is available. This behavior is also reflected in the createTokenSet logic
  return {
    ...state,
    lastSyncedState,
    tokens: values,
    themes: (payload.themes ?? []).map((theme) => ({
      ...theme,
      selectedTokenSets: Object.fromEntries(
        Object.entries(theme.selectedTokenSets).filter(
          ([setName, status]) => allAvailableTokenSets.includes(setName) && status !== TokenSetStatus.DISABLED,
        ),
      ),
    })),
    activeTheme: newActiveTheme ?? {},
    ...(Object.keys(payload.values).includes(state.activeTokenSet)
      ? {}
      : {
        activeTokenSet: Array.isArray(payload.values) ? 'global' : Object.keys(payload.values)[0],
      }),
    usedTokenSet: finalUsedTokenSets,
    tokensSize,
    themesSize,
  };
}
