import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';

export function useIsProUser() {
  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);
  return useMemo(() => (Boolean(existingKey && !licenseKeyError)), [existingKey, licenseKeyError]);
}
