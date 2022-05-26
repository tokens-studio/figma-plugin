import { useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import Case from 'case';
import { planSelector } from '@/selectors/planSelector';
import { clientEmailSelector } from '@/selectors/getClientEmail';
import { activeTabSelector, licenseStatusSelector } from '@/selectors';
import { entitlementsSelector } from '@/selectors/getEntitlements';
import { Entitlements } from '../store/models/userState';
import { LicenseStatus } from '@/constants/LicenseStatus';
import Settings from './Settings';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import Navbar from './Navbar';
import { userIdSelector } from '@/selectors/userIdSelector';
import FigmaLoading from './FigmaLoading';

let ldIdentificationResolver: (flags: LDProps['flags']) => void = () => {};

export const ldIdentificationPromise = new Promise<LDProps['flags']>((resolve) => {
  ldIdentificationResolver = resolve;
});

function MainContent() {
  const activeTab = useSelector(activeTabSelector);
  const plan = useSelector(planSelector);
  const ldClient = useLDClient();
  const clientEmail = useSelector(clientEmailSelector);
  const entitlements = useSelector(entitlementsSelector);
  const licenseStatus = useSelector(licenseStatusSelector);
  const userId = useSelector(userIdSelector);

  useEffect(() => {
    if (
      userId
      && ldClient
      && licenseStatus !== LicenseStatus.UNKNOWN
      && licenseStatus !== LicenseStatus.VERIFYING
      // license should be verified (or returned an error) before identifying launchdarkly with entitlements
    ) {
      const userAttributes: Record<string, string | boolean> = {
        plan: plan || '',
        os: !entitlements.includes(Entitlements.PRO),
      };

      entitlements.forEach((entitlement) => {
        userAttributes[entitlement] = true;
      });

      // we need to be able to await the identifiaction process in the initiator
      // this logic could be improved later to be more reactive
      ldClient
        .identify({
          key: userId!,
          custom: userAttributes,
          email: clientEmail,
        })
        .then((rawFlags) => {
          const normalizedFlags = Object.fromEntries(
            Object.entries(rawFlags).map(([key, value]) => [Case.camel(key), value]),
          );
          ldIdentificationResolver(normalizedFlags);
        });
    }
  }, [userId, ldClient, licenseStatus, plan, clientEmail, entitlements]);
  return (
    <>
      {activeTab !== 'start' && activeTab !== 'loading' && <Navbar />}
      {activeTab === 'start' && <StartScreen />}
      <Tokens isActive={activeTab === 'tokens'} />
      {activeTab === 'inspector' && <Inspector />}
      {activeTab === 'settings' && <Settings />}
      {activeTab === 'loading' && <FigmaLoading />}
    </>
  );
}

export default MainContent;
