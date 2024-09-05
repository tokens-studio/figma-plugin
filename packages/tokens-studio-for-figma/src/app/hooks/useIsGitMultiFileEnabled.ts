import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { apiSelector } from '@/selectors';
import {
  ADOStorageType, BitbucketStorageType, GitHubStorageType, GitLabStorageType,
} from '@/types/StorageType';

export function useIsGitMultiFileEnabled() {
      type StorageWithFilePaths = GitHubStorageType | GitLabStorageType | ADOStorageType | BitbucketStorageType;
      const api = useSelector(apiSelector) as StorageWithFilePaths;

      return useMemo(
        () => Boolean((api?.provider === AVAILABLE_PROVIDERS.GITHUB
            || api?.provider === AVAILABLE_PROVIDERS.GITLAB
            || api?.provider === AVAILABLE_PROVIDERS.ADO
            || api?.provider === AVAILABLE_PROVIDERS.BITBUCKET)
          && !api?.filePath?.endsWith('.json')),
        [api],
      );
}
