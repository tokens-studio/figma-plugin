import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';
import { tokensStudioPATSelector } from '@/selectors/tokensStudioPATSelector';
import { useFlags } from '@/app/components/LaunchDarkly';

export function useIsProUser() {
  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);
  const validPAT = useSelector(tokensStudioPATSelector);
  const flags = useFlags();

  return useMemo(() => {
    // Feature flag to bypass license check when server is down
    // If LaunchDarkly is down, flags.bypassLicenseCheck will be undefined
    // In that case, default to false to enforce normal license validation
    if (flags.bypassLicenseCheck === undefined) {
      return Boolean(existingKey && !licenseKeyError) || Boolean(validPAT);
    }

    if (flags.bypassLicenseCheck === true) {
      // Feature flag explicitly enabled, bypass license check
      return true;
    }

    // Feature flag is false, use normal license validation
    return Boolean(existingKey && !licenseKeyError) || Boolean(validPAT);
  }, [existingKey, licenseKeyError, validPAT, flags.bypassLicenseCheck]);
}
