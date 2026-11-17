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
  // Older versions left an active theme listed under its previous group after it was moved, so it
  // was counted twice in the theme menu. Keep every theme that is listed under its current group,
  // move one listed under another group to its current group if nothing is active there yet, and
  // drop the rest (duplicates and themes that no longer exist). The set of active themes stays the
  // same, so usedTokenSet still matches it.
  const groupOf = (themeId: string) => {
    const theme = payload.themes?.find((t) => t.id === themeId);
    return theme ? theme.group || INTERNAL_THEMES_NO_GROUP : undefined;
  };
  const activeThemeEntries = Object.entries(payload.activeTheme ?? {});
  const newActiveTheme: Record<string, string> = {};
  activeThemeEntries.forEach(([group, themeId]) => {
    if (groupOf(themeId) === group) {
      newActiveTheme[group] = themeId;
    }
  });
  activeThemeEntries.forEach(([group, themeId]) => {
    const currentGroup = groupOf(themeId);
    if (currentGroup && currentGroup !== group && !(currentGroup in newActiveTheme)) {
      newActiveTheme[currentGroup] = themeId;
    }
  });

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
    activeTheme: newActiveTheme,
    ...(Object.keys(payload.values).includes(state.activeTokenSet)
      ? {}
      : {
        activeTokenSet: Array.isArray(payload.values) ? 'global' : Object.keys(payload.values)[0],
      }),
    usedTokenSet: Array.isArray(payload.values) ? { global: TokenSetStatus.ENABLED } : usedTokenSets,
    tokensSize,
    themesSize,
    serverResolvedTokens: null,
  };
}
