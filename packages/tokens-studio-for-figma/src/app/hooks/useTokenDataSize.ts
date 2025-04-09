import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { tokensSelector, storageTypeSelector } from '@/selectors';
import { getDataSize } from '@/utils/sizeCheck';
import { StorageProviderType } from '@/constants/StorageProviderType';

/**
 * Hook to get the size of token data in KB
 * Only returns a value for local storage
 */
export default function useTokenDataSize() {
  const tokens = useSelector(tokensSelector);
  const storageType = useSelector(storageTypeSelector);
  const [dataSize, setDataSize] = useState<number | null>(null);

  const calculateSize = useCallback(() => {
    if (storageType.provider === StorageProviderType.LOCAL) {
      const size = getDataSize(tokens);
      setDataSize(Math.round(size / 1024)); // Convert to KB
    } else {
      setDataSize(null);
    }
  }, [tokens, storageType]);

  useEffect(() => {
    calculateSize();
  }, [calculateSize]);

  return dataSize;
}
