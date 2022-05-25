import React from 'react';

import { useSelector } from 'react-redux';
import { LDProvider } from 'launchdarkly-react-client-sdk';
import FigmaLoading from './FigmaLoading';
import Footer from './Footer';
import Changelog from './Changelog';
import ImportedTokensDialog from './ImportedTokensDialog';
import ConfirmDialog from './ConfirmDialog';
import PushDialog from './PushDialog';
import WindowResizer from './WindowResizer';
import Box from './Box';
import { activeTabSelector } from '@/selectors';
import LoadingBar from './LoadingBar';
import PluginResizerWrapper from './PluginResizer';
import { userIdSelector } from '@/selectors/userIdSelector';
import App from './App';

const ldClientSideId = process.env.LAUNCHDARKLY_SDK_CLIENT || '';

function AppContainer() {
  const activeTab = useSelector(activeTabSelector);
  const userId = useSelector(userIdSelector);
  if (!userId) return null;

  return (
    <LDProvider clientSideID={ldClientSideId} user={{ key: userId }}>
      <Box css={{ backgroundColor: '$bgDefault' }}>
        {activeTab !== 'loading' && <LoadingBar />}
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
              <App />
              {activeTab === 'loading' && <FigmaLoading />}
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
    </LDProvider>
  );
}

export default AppContainer;
