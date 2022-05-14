import React from 'react';
import { ProviderConfig, withLDProvider as withLDProviderRaw } from 'launchdarkly-react-client-sdk';

export const withLDProvider = process.env.LAUNCHDARKLY_FLAGS
  ? function withLDProvider<T = {}>(config: ProviderConfig) {
    console.log('LaunchDarkly config:', config);
    return (WrappedComponent: React.ComponentType<T>) => (
      (props: T) => <WrappedComponent {...props} />
    );
  } : withLDProviderRaw;
