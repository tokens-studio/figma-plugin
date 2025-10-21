import { useFlags as useFlagsRaw } from 'launchdarkly-react-client-sdk';

// eslint-disable-next-line no-underscore-dangle
declare global {
  interface Window {
    // eslint-disable-next-line no-underscore-dangle
    __CYPRESS_FEATURE_FLAGS__?: Record<string, any>;
  }
}

export const useFlags = process.env.LAUNCHDARKLY_FLAGS
  ? () => {
    // Get flags from environment variable
    const envFlags = Object.fromEntries(
      process.env.LAUNCHDARKLY_FLAGS!.split(',').map((flag) => [flag, true]),
    );

    // Check if Cypress has set additional feature flags and merge them
    // eslint-disable-next-line no-underscore-dangle
    if (typeof window !== 'undefined' && window.__CYPRESS_FEATURE_FLAGS__) {
      // eslint-disable-next-line no-underscore-dangle
      return { ...envFlags, ...window.__CYPRESS_FEATURE_FLAGS__ };
    }

    return envFlags;
  }
  : () => {
    // Check if Cypress has set feature flags
    // eslint-disable-next-line no-underscore-dangle
    if (typeof window !== 'undefined' && window.__CYPRESS_FEATURE_FLAGS__) {
      // eslint-disable-next-line no-underscore-dangle
      return window.__CYPRESS_FEATURE_FLAGS__;
    }
    // Otherwise use the real LaunchDarkly SDK
    return useFlagsRaw();
  };
