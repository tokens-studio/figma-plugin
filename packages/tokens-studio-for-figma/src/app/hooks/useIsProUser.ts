import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';
import { tokensStudioPATSelector } from '@/selectors/tokensStudioPATSelector';
import { storageTypeSelector } from '@/selectors/storageTypeSelector';
import { StorageProviderType } from '@/constants/StorageProviderType';

export function useIsProUser() {
  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);
  const validPAT = useSelector(tokensStudioPATSelector);
  const storageType = useSelector(storageTypeSelector);

  return useMemo(() => (
    Boolean(existingKey && !licenseKeyError) || Boolean(validPAT && storageType?.provider === StorageProviderType.TOKENS_STUDIO)
  ), [existingKey, licenseKeyError, validPAT, storageType]);
}
