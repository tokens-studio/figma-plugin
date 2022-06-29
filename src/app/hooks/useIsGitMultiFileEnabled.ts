import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { apiSelector } from '@/selectors';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { useFlags } from '../components/LaunchDarkly';

export function useIsGitMultiFileEnabled() {
  const api = useSelector(apiSelector);
  const { multiFileSync } = useFlags();

  return useMemo(() => (
    Boolean(
      multiFileSync
      && (api?.provider === StorageProviderType.GITHUB || api?.provider === StorageProviderType.GITLAB || api?.provider === StorageProviderType.ADO)
      && !api?.filePath?.endsWith('.json'),
    )
  ), [api, multiFileSync]);
}
