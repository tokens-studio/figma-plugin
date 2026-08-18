import { useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  lastSyncedStateSelector,
  remoteDataSelector,
  storageTypeSelector,
  themesListSelector,
  tokensSelector,
} from '@/selectors';
import { tokenSetMetadataSelector } from '@/selectors/tokenSetMetadataSelector';
import { findDifferentState } from '@/utils/findDifferentState';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { compareLastSyncedState } from '@/utils/compareLastSyncedState';
import { tokenFormatSelector } from '@/selectors/tokenFormatSelector';
import { tryParseJson } from '@/utils/tryParseJson';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { buildGitMetadata } from '@/utils/buildGitMetadata';

export function useChangedState() {
  const remoteData = useSelector(remoteDataSelector);
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const storageType = useSelector(storageTypeSelector);
  const lastSyncedState = useSelector(lastSyncedStateSelector);
  const tokenFormat = useSelector(tokenFormatSelector);
  const tokenSetMetadata = useSelector(tokenSetMetadataSelector);
  const dispatch = useDispatch();

  // Only Tokens Studio OAuth persists tokenSetsData in its metadata payload; git-based
  // providers share the shape produced by buildGitMetadata (same helper the push callbacks
  // use), so the diff and the on-disk write always agree. A mismatch here would produce a
  // permanent phantom metadata diff, triggering empty pushes and a false "$metadata changed"
  // row in the push dialog. tokenFormat is part of that shape so a legacy↔DTCG conversion
  // registers as a metadata change (see GitSyncOptimizer.optimizeSync).
  const buildMetadata = useCallback((tokenSetOrder: string[]) => {
    if (storageType.provider === StorageProviderType.LOCAL) return {};
    if (storageType.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      return { tokenSetOrder, tokenSetsData: tokenSetMetadata };
    }
    return buildGitMetadata(tokens, tokenFormat);
  }, [storageType.provider, tokenSetMetadata, tokenFormat, tokens]);

  // Detect a format flip since the last sync. lastSyncedState records [tokens, themes, format]
  // (see compareLastSyncedState); format at index 2 is missing on very old syncs or a
  // malformed blob, in which case we treat the state as aligned to avoid a spurious full
  // rewrite on first push after upgrade.
  const tokenFormatChanged = useMemo(() => {
    if (!lastSyncedState) return false;
    const parsed = tryParseJson<unknown>(lastSyncedState);
    if (!Array.isArray(parsed) || parsed.length < 3) return false;
    const lastFormat = parsed[2] as TokenFormatOptions | undefined;
    if (!lastFormat) return false;
    return lastFormat !== tokenFormat;
  }, [lastSyncedState, tokenFormat]);

  const changedPushState = useMemo(() => {
    const tokenSetOrder = Object.keys(tokens);
    return findDifferentState(remoteData, {
      tokens,
      themes,
      metadata: buildMetadata(tokenSetOrder),
    });
  }, [remoteData, tokens, themes, buildMetadata]);

  const changedPullState = useMemo(() => {
    const tokenSetOrder = Object.keys(tokens);
    return findDifferentState(
      {
        tokens,
        themes,
        metadata: buildMetadata(tokenSetOrder),
      },
      remoteData,
    );
  }, [remoteData, tokens, themes, buildMetadata]);

  const hasChanges = useMemo(() => {
    const hasChanged = !compareLastSyncedState(tokens, themes, lastSyncedState, tokenFormat);

    return hasChanged;
  }, [tokens, themes, lastSyncedState, tokenFormat]);

  // Move the dispatch call to useEffect to avoid setState during render
  useEffect(() => {
    // Studio OAuth pushes every change immediately via REST — no local-only changes exist
    if (storageType.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      dispatch.tokenState.updateCheckForChanges(false);
      return;
    }
    dispatch.tokenState.updateCheckForChanges(hasChanges);
  }, [hasChanges, dispatch.tokenState, storageType.provider]);

  return {
    changedPushState, changedPullState, hasChanges, tokenFormatChanged,
  };
}
