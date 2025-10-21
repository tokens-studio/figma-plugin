import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';
import { tokensStudioPATSelector } from '@/selectors/tokensStudioPATSelector';

export function useIsProUser() {
  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);
  const validPAT = useSelector(tokensStudioPATSelector);

  return useMemo(() => (
    Boolean(existingKey && !licenseKeyError) || Boolean(validPAT)
  ), [existingKey, licenseKeyError, validPAT]);
}
