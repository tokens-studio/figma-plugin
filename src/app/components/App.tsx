import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { withLDProvider, useLDClient } from 'launchdarkly-react-client-sdk';
import Settings from './Settings';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import Navbar from './Navbar';
import LoadingBar from './LoadingBar';
import Footer from './Footer';
import Changelog from './Changelog';
import ImportedTokensDialog from './ImportedTokensDialog';
import { Initiator } from './Initiator';
import ConfirmDialog from './ConfirmDialog';
import PushDialog from './PushDialog';
import WindowResizer from './WindowResizer';
import Box from './Box';
import { activeTabSelector } from '@/selectors';
import PluginResizerWrapper from './PluginResizer';
import { userIdSelector } from '@/selectors/userIdSelector';
import { planSelector } from '@/selectors/planSelector';
import { userNameSelector } from '@/selectors/userNameSelector';

function App() {
  const activeTab = useSelector(activeTabSelector);
  const userId = useSelector(userIdSelector);
  const userName = useSelector(userNameSelector);
  const plan = useSelector(planSelector);
  const ldClient = useLDClient();

  useEffect(() => {
    if (userId) {
      ldClient?.identify({
        key: userId!,
        custom: {
          plan,
          name: userName,
        },
      });
    }
  }, [userId, ldClient, plan, userName]);

  return (
    <Box css={{ backgroundColor: '$bgDefault' }}>
      <Initiator />
      <LoadingBar />
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
            {activeTab !== 'start' && <Navbar />}
            {activeTab === 'start' && <StartScreen />}
            <Tokens isActive={activeTab === 'tokens'} />
            {activeTab === 'inspector' && <Inspector />}
            {activeTab === 'settings' && <Settings />}
          </Box>
          <Footer />
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
