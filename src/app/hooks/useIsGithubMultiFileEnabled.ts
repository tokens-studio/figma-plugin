import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { apiSelector } from '@/selectors';
import { StorageProviderType } from '@/constants/StorageProviderType';

export function useIsGithubMultiFileEnabled() {
  const api = useSelector(apiSelector);
  const { multiFileSync } = useFlags();

  return useMemo(() => (
    Boolean(
      multiFileSync
      && (api?.provider === StorageProviderType.GITHUB || api?.provider === StorageProviderType.GITLAB)
      && !api?.filePath?.endsWith('.json'),
    )
  ), [api, multiFileSync]);
}
