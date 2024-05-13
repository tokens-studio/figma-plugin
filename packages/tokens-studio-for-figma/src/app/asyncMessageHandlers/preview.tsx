import React, {
  // useState, useEffect, useRef, useCallback,
  ReactNode,
} from 'react';
import { Box, Text } from '@tokens-studio/ui';
import { useStore } from 'react-redux';

import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { RootState } from '../store';
// eslint-disable-next-line
const PREVIEW_ENV = process.env.PREVIEW_ENV

function PreviewApp({ children }: { children: ReactNode }) {
  const isConnected = AsyncMessageChannel.ReactInstance.isWsConnected;

  const store = useStore<RootState>();

  return (
    <Box css={{
      justifyContent: 'center', alignItems: 'center', padding: '40px', backgroundColor: '$bgSubtle', height: '100vw',
    }}
    >
      {PREVIEW_ENV === 'browser' ? (
        <>
          <Box css={{
            color: '$fgMuted',
            backgroundColor: '$bgSurface',
            padding: '$4',
            borderRadius: '12px',
            marginBottom: '40px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          >
            <Box css={{ flexDirection: 'row' }}>
              <Text css={{ fontSize: '20px' }}>
                Connection Status:
                <Text>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </Text>
            </Box>
          </Box>
          {isConnected && (
            <Box css={{
              width: store?.getState()?.settings?.uiWindow?.width || '400px',
              height: store?.getState()?.settings?.uiWindow?.height || '300px',
            }}
            >
              {children}
            </Box>
          )}
        </>
      ) : (
        <>
          {/* <span /> */}
          <Box css={{
            backgroundColor: '$bgSubtle', color: '$fgMuted', padding: '$4', borderRadius: '12px',
          }}
          >
            <Box css={{ flexDirection: 'row' }}>
              <Text css={{ fontSize: '20px' }}>
                Connection Status:
                <Text>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </Text>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}

export default PreviewApp;
