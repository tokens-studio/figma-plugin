import React from 'react';

import { useSelector } from 'react-redux';
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
import MainContent, { ldIdentificationPromise } from './MainContent';
import LDProviderWrapper from './LaunchDarkly';
import Initiator from './Initiator';

function App() {
  const activeTab = useSelector(activeTabSelector);
  return (
    <LDProviderWrapper>
      <>
        <Initiator identificationPromise={ldIdentificationPromise} />
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
                <MainContent />
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
      </>
    </LDProviderWrapper>
  );
}

export default App;
