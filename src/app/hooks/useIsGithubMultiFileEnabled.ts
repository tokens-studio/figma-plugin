import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { apiSelector, featureFlagsSelector } from '@/selectors';
import { StorageProviderType } from '@/types/api';

export function useIsGithubMultiFileEnabled() {
  const api = useSelector(apiSelector);
  const featureFlags = useSelector(featureFlagsSelector);

  return useMemo(() => (
    Boolean(
      featureFlags?.gh_mfs_enabled
      && (api.provider === StorageProviderType.GITHUB || api.provider === StorageProviderType.GITLAB)
      && !api?.filePath?.endsWith('.json'),
    )
  ), [api, featureFlags]);
}
