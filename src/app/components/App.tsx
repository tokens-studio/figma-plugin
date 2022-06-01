import React from 'react';
import { useSelector } from 'react-redux';
import Settings from './Settings';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import Navbar from './Navbar';
import FigmaLoading from './FigmaLoading';
import Footer from './Footer';
import Changelog from './Changelog';
import ImportedTokensDialog from './ImportedTokensDialog';
import ConfirmDialog from './ConfirmDialog';
import PushDialog from './PushDialog';
import WindowResizer from './WindowResizer';
import Box from './Box';
import { activeTabSelector } from '@/selectors';
import PluginResizerWrapper from './PluginResizer';
import LoadingBar from './LoadingBar';
import { LDIdentifier, LDProviderWrapper } from './LaunchDarkly';
import { Initiator } from './Initiator';

function App() {
  const activeTab = useSelector(activeTabSelector);
  return (
    <>
      <Initiator />
      <LDProviderWrapper>
        <Box css={{ backgroundColor: '$bgDefault' }}>
          <LDIdentifier />
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
                {activeTab === 'loading' && <FigmaLoading />}
                {activeTab !== 'start' && activeTab !== 'loading' && <Navbar />}
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
      </LDProviderWrapper>
    </>
  );
}

export default App;
