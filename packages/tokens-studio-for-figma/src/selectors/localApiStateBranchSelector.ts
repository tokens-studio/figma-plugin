import { createSelector } from 'reselect';
import { localApiStateSelector } from './localApiStateSelector';
import { isGitProvider, isTokensStudioOAuthType } from '@/utils/is';

export const localApiStateBranchSelector = createSelector(
  localApiStateSelector,
  (api) => {
    if (isGitProvider(api)) {
      return api.branch;
    }
    if (isTokensStudioOAuthType(api)) {
      return api.branch || 'main';
    }
    return null;
  },
);
