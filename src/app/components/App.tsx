import React from 'react';
import { useSelector } from 'react-redux';
import Settings from './Settings';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import Navbar from './Navbar';
import FigmaLoading from './FigmaLoading';
import Footer from './Footer';
import Box from './Box';
import { activeTabSelector } from '@/selectors';
import PluginResizerWrapper from './PluginResizer';
import LoadingBar from './LoadingBar';

function App() {
  const activeTab = useSelector(activeTabSelector);

  return (
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
            {activeTab === 'loading' && <FigmaLoading />}
            {activeTab !== 'start' && activeTab !== 'loading' && <Navbar />}
            {activeTab === 'start' && <StartScreen />}
            <Tokens isActive={activeTab === 'tokens'} />
            {activeTab === 'inspector' && <Inspector />}
            {activeTab === 'settings' && <Settings />}
          </Box>
          {activeTab !== 'loading' && activeTab !== 'start' && <Footer />}
        </Box>
      </PluginResizerWrapper>
    </Box>
  );
}

export default App;
