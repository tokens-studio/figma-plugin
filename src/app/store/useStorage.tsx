import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { ContextObject } from '@/types/api';
import type { Dispatch } from '../store';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

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
      AsyncMessageChannel.message({
        type: AsyncMessageTypes.SET_STORAGE_TYPE,
        storageType: provider,
      });
    }
    dispatch.uiState.setStorage(provider);
  }, [dispatch]);

  return { setStorageType };
}
