import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { Dispatch } from '../store';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageType } from '@/types/StorageType';

type SetStorageTypeOptions = {
  provider: StorageType;
  shouldSetInDocument?: boolean;
};

export default function useStorage() {
  const dispatch = useDispatch<Dispatch>();

  const setStorageType = useCallback(({
    provider,
    shouldSetInDocument = false,
  }: SetStorageTypeOptions) => {
    if (shouldSetInDocument) {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SET_STORAGE_TYPE,
        storageType: provider,
      });
    }
    dispatch.uiState.setStorage(provider);
  }, [dispatch]);

  return { setStorageType };
}
