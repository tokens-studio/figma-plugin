import React from 'react';
import { useSelector } from 'react-redux';
import Settings from './Settings';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import Navbar from './Navbar';
import FigmaLoading from './FigmaLoading'
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

function App() {
  const activeTab = useSelector(activeTabSelector);

  return (
    <Box css={{ backgroundColor: '$bgDefault' }}>
      <Initiator />
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
            {(activeTab !=='start' && activeTab !== 'loading') && <Navbar/>}
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

export default App;
