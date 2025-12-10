import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { Dispatch } from '../store';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageType } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';

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
    let providerForDocument = provider;
    // Remove additionalHeaders for Generic Versioned Storage when writing to shared plugin data
    if (
      shouldSetInDocument
      && provider.provider === StorageProviderType.GENERIC_VERSIONED_STORAGE
      && typeof provider === 'object'
      && provider !== null
      && 'additionalHeaders' in provider
    ) {
      // Remove additionalHeaders property
      const { additionalHeaders, ...rest } = provider as any;
      providerForDocument = rest;
    }
    if (shouldSetInDocument) {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SET_STORAGE_TYPE,
        storageType: providerForDocument,
      });
    }
    dispatch.uiState.setStorage(provider);
  }, [dispatch]);

  return { setStorageType };
}
