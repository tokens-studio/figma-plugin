import React, { useEffect } from 'react';
import Case from 'case';
import { useSelector } from 'react-redux';
import { withLDProvider, useLDClient } from 'launchdarkly-react-client-sdk';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import Settings from './Settings';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import Navbar from './Navbar';
import FigmaLoading from './FigmaLoading';
import Footer from './Footer';
import Changelog from './Changelog';
import ImportedTokensDialog from './ImportedTokensDialog';
import { Initiator } from './Initiator';
import ConfirmDialog from './ConfirmDialog';
import PushDialog from './PushDialog';
import WindowResizer from './WindowResizer';
import Box from './Box';
import { activeTabSelector, licenseStatusSelector } from '@/selectors';
import PluginResizerWrapper from './PluginResizer';
import { userIdSelector } from '@/selectors/userIdSelector';
import { planSelector } from '@/selectors/planSelector';
import { clientEmailSelector } from '@/selectors/getClientEmail';
import { entitlementsSelector } from '@/selectors/getEntitlements';
import { Entitlements } from '../store/models/userState';
import LoadingBar from './LoadingBar';
import { LicenseStatus } from '@/constants/LicenseStatus';

const ldIdentificationResolver: (flags: LDProps['flags']) => void = () => {};

function App() {
  const activeTab = useSelector(activeTabSelector);
  const userId = useSelector(userIdSelector);
  const plan = useSelector(planSelector);
  const ldClient = useLDClient();
  const clientEmail = useSelector(clientEmailSelector);
  const entitlements = useSelector(entitlementsSelector);
  const licenseStatus = useSelector(licenseStatusSelector);

  useEffect(() => {
    if (
      userId
      && ldClient
      && (
        licenseStatus !== LicenseStatus.UNKNOWN
        && licenseStatus !== LicenseStatus.VERIFYING
        // license should be verified (or returned an error) before identifying launchdarkly with entitlements
      )
    ) {
      const userAttributes: Record<string, string | boolean> = {
        plan: plan || '',
        email: clientEmail || '',
        os: !entitlements.includes(Entitlements.PRO),
      };

      entitlements.forEach((entitlement) => {
        userAttributes[entitlement] = true;
      });

      // we need to be able to await the identifiaction process in the initiator
      // this logic could be improved later to be more reactive
      ldClient.identify({
        key: userId!,
        custom: userAttributes,
      }).then((rawFlags) => {
        const normalizedFlags = Object.fromEntries(
          Object.entries(rawFlags).map(([key, value]) => (
            [Case.camel(key), value]
          )),
        );
        ldIdentificationResolver(normalizedFlags);
      });
    }
  }, [userId, ldClient, licenseStatus, plan, clientEmail, entitlements]);

  return (
    <Box css={{ backgroundColor: '$bgDefault' }}>
      <Initiator />
      { activeTab !== 'loading' && <LoadingBar />}
      <PluginResizerWrapper>
        <Box
          css={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Box
            css={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {activeTab === 'loading' && <FigmaLoading />}
            {(activeTab !== 'start' && activeTab !== 'loading') && <Navbar />}
            {activeTab === 'start' && <StartScreen />}
            <Tokens isActive={activeTab === 'tokens'} />
            {activeTab === 'inspector' && <Inspector />}
            {activeTab === 'settings' && <Settings />}
          </Box>
          {activeTab !== 'loading' && activeTab !== 'start' && <Footer />}
          <Changelog />
          <ImportedTokensDialog />
          <ConfirmDialog />
          <PushDialog />
          <WindowResizer />
        </Box>
      </PluginResizerWrapper>
    </Box>
  );
}

export default withLDProvider({
  clientSideID: process.env.LAUNCHDARKLY_SDK_CLIENT!,
})(App);
