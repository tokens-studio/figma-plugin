import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { postToFigma } from '@/plugin/notifiers';
import { ContextObject } from '@/types/api';
import { MessageToPluginTypes } from '@/types/messages';
import type { Dispatch } from '../store';

type SetStorageTypeOptions = {
  provider: ContextObject;
  shouldSetInDocument?: boolean;
};

export default function useStorage() {
  const dispatch = useDispatch<Dispatch>();

  const setStorageType = useCallback(({
    provider,
    shouldSetInDocument = false,
  }: SetStorageTypeOptions) => {
    if (shouldSetInDocument) {
      postToFigma({
        type: MessageToPluginTypes.SET_STORAGE_TYPE,
        storageType: provider,
      });
    }
    dispatch.uiState.setStorage(provider);
  }, [dispatch]);

  return { setStorageType };
}
