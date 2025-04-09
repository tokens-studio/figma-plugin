import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { storageTypeSelector, uiStateSelector } from '@/selectors';
import { StorageProviderType } from '@/constants/StorageProviderType';

export type StorageLocation = 'client' | 'shared' | null;

/**
 * Hook to determine if we're using client storage or shared plugin data
 * Returns 'client' for client storage, 'shared' for shared plugin data, or null for remote storage
 */
export default function useStorageLocation() {
  const storageType = useSelector(storageTypeSelector);
  const uiState = useSelector(uiStateSelector);
  const [storageLocation, setStorageLocation] = useState<StorageLocation>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (storageType.provider !== StorageProviderType.LOCAL) {
      // Remote storage always uses client storage
      setStorageLocation(null);
      setIsLoading(false);
      return;
    }

    // For local storage, check if user has chosen to use client storage
    // We can determine this from the UI state
    const useClientStorage = uiState.useClientStorageForLocal;
    setStorageLocation(useClientStorage ? 'client' : 'shared');
    setIsLoading(false);
  }, [storageType, uiState.useClientStorageForLocal]);

  return { storageLocation, isLoading };
}
