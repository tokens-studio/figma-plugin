import React from 'react';
import { withLDProvider as withLDProviderRaw } from 'launchdarkly-react-client-sdk';

export const withLDProvider = process.env.LAUNCHDARKLY_FLAGS
  ? function withLDProvider<T = {}>() {
    return (WrappedComponent: React.ComponentType<T>) => (
      (props: T) => <WrappedComponent {...props} />
    );
  } : withLDProviderRaw;
