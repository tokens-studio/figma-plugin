import React from 'react';
import { useSelector } from 'react-redux';
import { IconoirProvider } from 'iconoir-react';
import Settings from './Settings';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import Navbar from './Navbar';
import FigmaLoading from './FigmaLoading';
import SecondSceen from './SecondScreen';
import Footer from './Footer';
import Box from './Box';
import { activeTabSelector } from '@/selectors';
import PluginResizerWrapper from './PluginResizer';
import LoadingBar from './LoadingBar';
import { ConvertToDTCGModal } from './ConvertToDTCGModal';
import Subscription from './Subscription';
import { OAuthDeviceCodeModal } from './Login/OAuthDeviceCodeModal';

function App() {
  const activeTab = useSelector(activeTabSelector);

  return (
    <Box css={{ isolation: 'isolate' }}>
      <IconoirProvider
        iconProps={{
          color: '$fgDefault',
          strokeWidth: 1.5,
          width: '1rem',
          height: '1rem',
        }}
      >
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
              {activeTab === 'secondscreen' && <SecondSceen />}
              {activeTab === 'settings' && <Settings />}
              {activeTab === 'subscription' && <Subscription />}
            </Box>
            {activeTab !== 'loading' && activeTab !== 'start' && <Footer />}
          </Box>

        </PluginResizerWrapper>
        <ConvertToDTCGModal />
        <OAuthDeviceCodeModal />
      </IconoirProvider>
    </Box>
  );
}

export default App;
