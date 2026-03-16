import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';
import { tokensStudioPATSelector } from '@/selectors/tokensStudioPATSelector';
import { storageTypeSelector } from '@/selectors/storageTypeSelector';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { useAuthStore } from '@/app/store/useAuthStore';

export function useIsProUser() {
  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);
  const validPAT = useSelector(tokensStudioPATSelector);
  const storageType = useSelector(storageTypeSelector);
  const { isPro } = useAuthStore();

  return useMemo(() => {
    const hasLicenseKey = Boolean(existingKey && !licenseKeyError);
    const hasTokensStudioPAT = Boolean(validPAT && (storageType?.provider === StorageProviderType.TOKENS_STUDIO));
    return hasLicenseKey || hasTokensStudioPAT || isPro;
  }, [existingKey, licenseKeyError, validPAT, storageType, isPro]);
}
