import React from 'react';
import { useSelector } from 'react-redux';
import Settings from './Settings';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import { Navbar } from './Navbar';
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
import { globalCss } from '@/stitches.config';

const globalStyles = globalCss({
  body: { fontFamily: '$sans', fontSize: '$small' },
});

function App() {
  const activeTab = useSelector(activeTabSelector);

  globalStyles();

  return (
    <Box css={{ backgroundColor: '$bgDefault' }}>
      <Initiator />
      <LoadingBar />
      <Box css={{
        display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      }}
      >
        <Box css={{
          display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%', overflow: 'hidden',
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
    </Box>
  );
}

export default App;
