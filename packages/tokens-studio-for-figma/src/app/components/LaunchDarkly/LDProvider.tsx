import React from 'react';
import { LDProvider } from 'launchdarkly-react-client-sdk';
import { useSelector } from 'react-redux';
import { userIdSelector } from '@/selectors/userIdSelector';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';

interface LDProviderProps {
  children: JSX.Element;
}

const ldClientSideId = process.env.LAUNCHDARKLY_SDK_CLIENT || '';

export const LDProviderWrapper = ({ children }: LDProviderProps) => {
  const userId = useSelector(userIdSelector);
  // @README we only want to set-up LD if there is a license key to reduce the amount of API calls
  const licenseKey = useSelector(licenseKeySelector);

  return (
    <LDProvider
      deferInitialization
      clientSideID={ldClientSideId}
      user={userId && licenseKey ? { key: userId } : undefined}
    >
      {children}
    </LDProvider>
  );
};

export function withLDProviderWrapper<P>(Component: React.ComponentType<P>) {
  return (props: P) => (
    <LDProviderWrapper>
      <Component {...props} />
    </LDProviderWrapper>
  );
}
