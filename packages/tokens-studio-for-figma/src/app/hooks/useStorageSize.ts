import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { calculateStorageSize } from '@/utils/calculateStorageSize';
import { localTokenDataSelector, storageTypeSelector } from '@/selectors';
import { StorageProviderType } from '@/constants/StorageProviderType';

export function useStorageSize() {
  const localTokenData = useSelector(localTokenDataSelector);
  const storageType = useSelector(storageTypeSelector);
  
  const isLocalStorage = storageType.provider === StorageProviderType.LOCAL;
  
  const storageSize = useMemo(() => {
    if (isLocalStorage && localTokenData) {
      return calculateStorageSize(localTokenData);
    }
    return 0;
  }, [isLocalStorage, localTokenData]);
  
  return {
    storageSize,
    isLocalStorage,
  };
}
