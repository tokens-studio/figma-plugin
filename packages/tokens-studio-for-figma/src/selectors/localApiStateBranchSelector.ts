import { createSelector } from 'reselect';
import { localApiStateSelector } from './localApiStateSelector';
import { isGitProvider } from '@/utils/is';
import { StorageProviderType } from '@/constants/StorageProviderType';

export const localApiStateBranchSelector = createSelector(
  localApiStateSelector,
  (api) => {
    if (isGitProvider(api)) {
      return api.branch;
    }
    if (api && api.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      return (api as any).branch || 'main';
    }
    return null;
  },
);
