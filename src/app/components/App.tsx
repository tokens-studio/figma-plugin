import * as React from 'react';
import { useSelector } from 'react-redux';
import JSONEditor from './JSONEditor';
import SyncSettings from './SyncSettings';
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
import { RootState } from '../store';
import ConfirmDialog from './ConfirmDialog';
import PushDialog from './PushDialog';
import WindowResizer from './WindowResizer';
import Box from './Box';

function App() {
  const activeTab = useSelector((state: RootState) => state.uiState.activeTab);

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
          {activeTab === 'syncsettings' && <SyncSettings />}
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
