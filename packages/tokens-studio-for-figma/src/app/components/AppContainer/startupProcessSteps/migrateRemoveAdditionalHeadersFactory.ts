import type { Dispatch } from '@/app/store';
import type { StartupMessage } from '@/types/AsyncMessages';
import { StorageProviderType } from '@/constants/StorageProviderType';

/**
 * Migration: Remove additionalHeaders from shared plugin data for Generic Versioned Storage.
 * This should be run on plugin startup.
 */
export function migrateRemoveAdditionalHeadersFactory(
  dispatch: Dispatch,
  params: StartupMessage,
  saveStorageType?: (storage: any) => void,
) {
  return async () => {
    // Only mutate the storageType if it's generic versioned and has additionalHeaders
    const st = params.storageType;
    if (
      st
      && typeof st === 'object'
      && st.provider === StorageProviderType.GENERIC_VERSIONED_STORAGE
      && 'additionalHeaders' in st
    ) {
      // Remove additionalHeaders property
      const { additionalHeaders, ...rest } = st as any;
      dispatch.uiState.setStorage(rest);
      if (saveStorageType) {
        saveStorageType(rest);
      }
    }
    // No-op for other providers
  };
}
