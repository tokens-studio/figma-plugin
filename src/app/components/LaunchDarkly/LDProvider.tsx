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
  const licenseKey = useSelector(licenseKeySelector);
  if (userId && licenseKey) {
    return (
      <LDProvider clientSideID={ldClientSideId} user={{ key: userId }}>
        {children}
      </LDProvider>
    );
  }
  return children;
};
