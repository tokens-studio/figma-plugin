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
  // providers write only { tokenSetOrder }, so including tokenSetsData here would produce
  // a permanent metadata diff (baseState from remote lacks it), triggering empty pushes.
  const buildMetadata = useCallback((tokenSetOrder: string[]) => {
    if (storageType.provider === StorageProviderType.LOCAL) return {};
    if (storageType.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      return { tokenSetOrder, tokenSetsData: tokenSetMetadata };
    }
    return { tokenSetOrder };
  }, [storageType.provider, tokenSetMetadata]);

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

  return { changedPushState, changedPullState, hasChanges };
}
