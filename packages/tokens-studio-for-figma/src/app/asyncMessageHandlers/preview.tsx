import React, {
  // useState, useEffect, useRef, useCallback,
  ReactNode,
} from 'react';
import { Box, Stack, Text } from '@tokens-studio/ui';
import { useStore } from 'react-redux';

import { RootState } from '../store';
import { AsyncMessageChannel } from '../../AsyncMessageChannel';
// eslint-disable-next-line
const PREVIEW_ENV = process.env.PREVIEW_ENV;

function PreviewApp({ children }: { children: ReactNode }) {
  const isConnected = AsyncMessageChannel.ReactInstance.isWsConnected;

  const store = useStore<RootState>();

  const previewHeader = (
    <Stack
      direction="row"
      css={{
        color: '$fgMuted',
        backgroundColor: '$bgSurface',
        padding: '$4',
        borderRadius: '$medium',
        marginBottom: '$7',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text css={{ fontSize: '20px' }}>Web Preview</Text>
      <Stack css={{ flex: 1 }}><span /></Stack>
      <Stack
        direction="row"
        css={{
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 8,
          paddingRight: 8,
          alignItems: 'center',
          border: `1px solid ${isConnected ? '$successFg' : '$dangerFg'}`,
          backgroundColor: isConnected ? '$successBg' : '$dangerBg',
          borderRadius: '4px',
        }}
      >
        <Text css={{ fontSize: '16px', color: isConnected ? '$successFg' : '$dangerFg' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </Stack>
    </Stack>
  );

  return (
    <Box css={{
      justifyContent: 'center', alignItems: 'center', padding: '40px', backgroundColor: '$bgSubtle', height: '100vh',
    }}
    >
      {PREVIEW_ENV === 'browser' ? (
        <>
          {previewHeader}
          <Box css={{
            width: store?.getState()?.settings?.uiWindow?.width || '400px',
            height: store?.getState()?.settings?.uiWindow?.height || '300px',
          }}
          >
            {children}
          </Box>
        </>
      ) : (
        <>
          {/* <span /> */}
          {previewHeader}
        </>
      )}
    </Box>
  );
}

export default PreviewApp;
