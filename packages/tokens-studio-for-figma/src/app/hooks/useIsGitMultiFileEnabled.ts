import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { apiSelector } from '@/selectors';
import { StorageProviderType } from '@/constants/StorageProviderType';

export function useIsGitMultiFileEnabled() {
  const api = useSelector(apiSelector);

  return useMemo(
    () => Boolean((api?.provider === StorageProviderType.GITHUB
            || api?.provider === StorageProviderType.GITLAB
            || api?.provider === StorageProviderType.ADO
            || api?.provider === StorageProviderType.BITBUCKET)
          && !api?.filePath?.endsWith('.json')),
    [api],
  );
}
