import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';
import { useAuthStore } from '@/app/store/useAuthStore';

export function useIsProUser() {
  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);
  const { isPro } = useAuthStore();

  return useMemo(() => {
    const hasLicenseKey = Boolean(existingKey && !licenseKeyError);
    // Pro is granted by a validated license key or an active Tokens Studio OAuth
    // subscription (`isPro`). The legacy PAT-based Tokens Studio path is deliberately
    // excluded: that server is decommissioned, so a locally-stored PAT can no longer be
    // validated and must not confer Pro on its own.
    return hasLicenseKey || isPro;
  }, [existingKey, licenseKeyError, isPro]);
}
