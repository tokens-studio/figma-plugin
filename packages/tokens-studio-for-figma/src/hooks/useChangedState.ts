import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import {
  lastSyncedStateSelector,
  remoteDataSelector,
  storageTypeSelector,
  themesListSelector,
  tokensSelector,
} from '@/selectors';
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
  const dispatch = useDispatch();

  const changedPushState = useMemo(() => {
    const tokenSetOrder = Object.keys(tokens);
    return findDifferentState(remoteData, {
      tokens,
      themes,
      metadata: storageType.provider !== StorageProviderType.LOCAL ? { tokenSetOrder } : {},
    });
  }, [remoteData, tokens, themes, storageType]);

  const changedPullState = useMemo(() => {
    const tokenSetOrder = Object.keys(tokens);
    return findDifferentState(
      {
        tokens,
        themes,
        metadata: storageType.provider !== StorageProviderType.LOCAL ? { tokenSetOrder } : {},
      },
      remoteData,
    );
  }, [remoteData, tokens, themes, storageType]);

  const hasChanges = useMemo(() => {
    if (storageType.provider === StorageProviderType.LOCAL) {
      return false;
    }
    const hasChanged = !compareLastSyncedState(tokens, themes, lastSyncedState, tokenFormat);

    dispatch.tokenState.updateCheckForChanges(hasChanged);

    return hasChanged;
  }, [storageType.provider, tokens, themes, lastSyncedState, tokenFormat, dispatch.tokenState]);

  return { changedPushState, changedPullState, hasChanges };
}
