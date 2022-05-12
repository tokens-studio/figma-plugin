import { useFlags as useFlagsRaw } from 'launchdarkly-react-client-sdk';

console.log(process.env.LAUNCHDARKLY_FLAGS);
export const useFlags = process.env.LAUNCHDARKLY_FLAGS
  ? () => (
    Object.fromEntries(process.env.LAUNCHDARKLY_FLAGS!.split(',').map((flag) => (
      [flag, true]
    )))
  )
  : useFlagsRaw;
