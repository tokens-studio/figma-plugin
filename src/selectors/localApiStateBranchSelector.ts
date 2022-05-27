import { createSelector } from 'reselect';
import { localApiStateSelector } from './localApiStateSelector';
import { isGitProvider } from '@/utils/is';

export const localApiStateBranchSelector = createSelector(
  localApiStateSelector,
  (api) => {
    if (isGitProvider(api)) {
      return api.branch;
    }
    return null;
  },
);
