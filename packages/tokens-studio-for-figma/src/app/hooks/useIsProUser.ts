/* eslint-disable @typescript-eslint/no-unused-vars */
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

  // TEMPORARY: License server and LaunchDarkly are down, always return true
  return useMemo(() => true, []);

  /* Original implementation - restore when servers are back up
  return useMemo(() => {
    // Feature flag to bypass license check when server is down
    if (flags.bypassLicenseCheck) {
      return true;
    }

    return Boolean(existingKey && !licenseKeyError) || Boolean(validPAT);
  }, [existingKey, licenseKeyError, validPAT, flags.bypassLicenseCheck]);
  */
}
