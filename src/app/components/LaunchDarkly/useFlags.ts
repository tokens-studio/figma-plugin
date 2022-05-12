import { useFlags as useFlagsRaw } from 'launchdarkly-react-client-sdk';

export const useFlags = !process.env.LAUNCHDARKLY_ENABLED
  ? () => ({
    tokenThemes: true,
    gitBranchSelector: true,
  })
  : useFlagsRaw;
