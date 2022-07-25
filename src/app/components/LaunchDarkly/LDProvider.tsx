import React from 'react';
import { LDProvider } from 'launchdarkly-react-client-sdk';
import { useSelector } from 'react-redux';
import { userIdSelector } from '@/selectors/userIdSelector';

interface LDProviderProps {
  children: JSX.Element;
}

const ldClientSideId = process.env.LAUNCHDARKLY_SDK_CLIENT || '';

export const LDProviderWrapper = ({ children }: LDProviderProps) => {
  const userId = useSelector(userIdSelector);
  if (userId) {
    return (
      <LDProvider clientSideID={ldClientSideId} user={{ key: userId }}>
        {children}
      </LDProvider>
    );
  }
  return children;
};

export function withLDProviderWrapper<P>(Component: React.ComponentType<P>) {
  return (props: P) => (
    <LDProviderWrapper>
      <Component {...props} />
    </LDProviderWrapper>
  );
}
