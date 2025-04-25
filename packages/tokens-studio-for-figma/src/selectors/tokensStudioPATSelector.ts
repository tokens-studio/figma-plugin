import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const tokensStudioPATSelector = createSelector(
  userStateSelector,
  (userState) => userState.tokensStudioPAT,
  {
    memoizeOptions: {
      resultEqualityCheck: (a, b) => a === b,
    },
  },
);
