import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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
import ConfirmDialog from './ConfirmDialog';
import PushDialog from './PushDialog';
import WindowResizer from './WindowResizer';
import Box from './Box';
import { activeTabSelector, windowSizeSelector } from '@/selectors';

function App() {
  const activeTab = useSelector(activeTabSelector);
  const windowSize = useSelector(windowSizeSelector);
  const [isPluginminimized, setIsPluginminimized] = useState(false);

  React.useEffect(() => {
    if (windowSize) setIsPluginminimized(windowSize.isMinimized);
  }, [windowSize]);

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
          {!isPluginminimized && (
          <>
            {' '}
            {activeTab === 'start' && <StartScreen />}
            <Tokens isActive={activeTab === 'tokens'} />
            {activeTab === 'inspector' && <Inspector />}
            {activeTab === 'syncsettings' && <SyncSettings />}
            {activeTab === 'settings' && <Settings />}
          </>
          ) }

        </Box>
        {!isPluginminimized && (
          <>
            <Footer />
            <Changelog />
            <ImportedTokensDialog />
            <ConfirmDialog />
            <PushDialog />
            <WindowResizer />
          </>
        )}
      </Box>
    </Box>
  );
}

export default App;
