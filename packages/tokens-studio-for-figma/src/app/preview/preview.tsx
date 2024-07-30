import React, {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Box, Button, DropdownMenu, IconButton, Stack, Text,
} from '@tokens-studio/ui';
import { useDispatch, useSelector } from 'react-redux';
import hash from 'object-hash';
import { Code, Expand, Collapse } from 'iconoir-react';

import { Editor } from '@monaco-editor/react';
import { CSS } from '@stitches/react';
import { Dispatch } from '../store';
import { AsyncMessageChannel } from '../../AsyncMessageChannel';
import { AsyncMessageChannelPreview } from '../../AsyncMessageChannelPreview';
import { AsyncMessageTypes, StartupMessage } from '@/types/AsyncMessages';
import { SavedSettings } from '@/plugin/notifiers';
import { UpdateMode } from '@/constants/UpdateMode';
import { StorageProviderType } from '@/constants/StorageProviderType';
import Modal from '../components/Modal';

import './preview.css';
import { settingsStateSelector, uiStateSelector } from '@/selectors';
import { Tabs } from '@/constants/Tabs';
import { setFigmaBrowserTheme } from './previewUtils';
import { useFigmaTheme } from '@/hooks/useFigmaTheme';
import { usePreviewState } from './usePreviewState';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';

// eslint-disable-next-line
const PREVIEW_ENV = process.env.PREVIEW_ENV;

const mockUser = {
  figmaId: 'figma:1234',
  userId: 'uid:1234',
  name: 'Jan Six',
};

// @ts-ignore
const mockSettings: SavedSettings = {
  language: 'en',
  width: 500,
  height: 800,
  ignoreFirstPartForStyles: false,
  inspectDeep: false,
  prefixStylesWithThemeName: false,
  showEmptyGroups: true,
  updateMode: UpdateMode.PAGE,
  updateOnChange: false,
  updateRemote: true,
  updateStyles: true,
};

// const mockStartupParams: Omit<StartupMessage, 'licenseKey'> = {
const mockStartupParams: Omit<StartupMessage, 'licenseKey'> = {
  type: AsyncMessageTypes.STARTUP,
  activeTheme: {},
  lastOpened: Date.now(),
  initialLoad: true,
  usedEmail: null,
  authData: null,
  onboardingExplainer: {
    sets: true,
    exportSets: true,
    inspect: true,
    syncProviders: true,
  },
  localApiProviders: [],
  settings: mockSettings,
  storageType: {
    provider: StorageProviderType.LOCAL,
  },
  user: mockUser,
  localTokenData: {
    activeTheme: '',
    checkForChanges: true,
    themes: [],
    usedTokenSet: null,
    updatedAt: new Date().toISOString(),
    values: {},
    collapsedTokenSets: null,
    tokenFormat: TokenFormatOptions.Legacy,
    version: '91',
  },
};

const mockActions = {
  STARTUP: {
    default: mockStartupParams,
  },
};

const dispatchMockMessage = (message) => {
  const messageId = hash({
    message,
    datetime: Date.now(),
  });

  const msg = { id: messageId, message };
  window.postMessage({ pluginMessage: msg });
};

const MockMessageForm = ({ type, handleClose }: { type?: string, handleClose: () => void }) => {
  const [value, setValue] = useState({
    STARTUP: JSON.stringify(mockStartupParams, null, 2),
    DEFAULT: '',
  }[type || 'DEFAULT'] || '');
  const [error, setError] = useState('');
  const handleJsonEditChange = useCallback((val) => {
    try {
      // eslint-disable-next-line
      const a = JSON.parse(val);
      if (error) {
        setError('');
      }
      setValue(val);
    } catch (err) {
      setError('Not valid JSON');
    }
  }, [setValue, error]);
  const { isDarkTheme } = useFigmaTheme();

  const isValid = true;

  const checkAndSubmitMessage = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = JSON.parse(value);
    dispatchMockMessage(message);

    handleClose();
  }, [value, handleClose]);

  return (
    <form onSubmit={checkAndSubmitMessage} style={{ display: 'flex', flexGrow: 1, height: '100%' }}>
      <Stack
        gap={3}
        direction="column"
        justify="start"
        css={{
          minHeight: '$8', position: 'relative', flexGrow: 1, height: '100%',
        }}
      >
        <Text>WIP</Text>
        <Box
          css={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            height: '100%',
            position: 'relative',
          }}
        >
          <Editor
            language="json"
            onChange={handleJsonEditChange}
            value={value}
            theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
            height={400}
            options={{
              minimap: {
                enabled: false,
              },
              lineNumbers: 'off',
              fontSize: 11,
              wordWrap: 'on',
              contextmenu: false,
            }}
          />
        </Box>
        <Box css={{ padding: '$3', paddingTop: '$2', paddingBottom: '$2' }}>
          <Text css={{ opacity: error ? 1 : 0, color: '$dangerFg' }}>{error || '0'}</Text>
        </Box>
        <Stack direction="row" justify="end" gap={3}>
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={!isValid || !!error} variant="primary" type="submit">
            Submit
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

const PreviewMockMessageModal = ({ type, handleClose }: { type: string | undefined, handleClose: () => void }) => (
  <Modal
    size="large"
    isOpen
    modal
    close={handleClose}
    title="Create Mock Action"
    full
  >
    <MockMessageForm type={type} handleClose={handleClose} />
  </Modal>
);

const PreviewPluginWindow = ({
  height = 600, width = '100%', children, css = {}, fullscreen, updateHash,
}: { children: ReactNode, height?: number | string, width?: number | string, css: CSS | undefined, fullscreen?: boolean, updateHash: any }) => {
  useEffect(() => {
    AsyncMessageChannelPreview.ReactInstance.message({
      type: AsyncMessageTypes.PREVIEW_REQUEST_STARTUP,
    });
  }, []);
  const toggleFullscreen = useCallback(() => {
    updateHash({ fullscreen: !fullscreen });
  }, [fullscreen, updateHash]);
  const { isDarkTheme } = useFigmaTheme();

  return (
    <Stack direction="column" css={{ height, width, ...css }}>
      <Stack
        direction="row"
        css={{
          padding: '$2', paddingLeft: '$3', minHeight: '40px', background: '$bgSurface', borderBottom: '1px solid $bgSubtle',
        }}
        align="center"
      >
        <Stack
          align="center"
          justify="center"
          css={{
            height: '$7', width: '$7', marginRight: '-$3', marginLeft: '-$2',
          }}
        >
          <Code style={{
            background: 'black', color: 'white', borderRadius: 2, height: 20, width: 20, padding: 2,
          }}
          />
        </Stack>
        <Stack css={{ flex: 1 }}>
          <Text css={{ paddingLeft: '$3', fontSize: '$small', fontWeight: '$sansSemibold' }}>Tokens Studio for Figma</Text>
        </Stack>
        <Stack align="center" justify="center" css={{ height: '$7', width: '$7' }}>
          {fullscreen ? (
            <IconButton
              tooltip=""
              data-testid="123"
              icon={(
                <Collapse style={{
                  color: isDarkTheme ? 'white' : 'black', borderRadius: 2, height: 20, width: 20,
                }}
                />
              )}
              size="small"
              variant="invisible"
              onClick={toggleFullscreen}
            />
          ) : (
            <IconButton
              tooltip=""
              data-testid="123"
              icon={(
                <Expand style={{
                  color: isDarkTheme ? 'white' : 'black', borderRadius: 2, height: 20, width: 20,
                }}
                />
              )}
              size="small"
              variant="invisible"
              onClick={toggleFullscreen}
            />
          )}
        </Stack>
      </Stack>
      <Box css={{
        width,
        height,
      }}
      >
        {children}
      </Box>
    </Stack>
  );
};

const themes = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

function PreviewApp({ children }: { children: ReactNode }) {
  const isConnected = (AsyncMessageChannel as typeof AsyncMessageChannelPreview).ReactInstance.isWsConnected;
  const [mockMessageModalOpen, setMockMessageModalOpen] = useState('');
  const dispatch = useDispatch<Dispatch>();
  const settings = useSelector(settingsStateSelector);
  const uiState = useSelector(uiStateSelector);
  const {
    data: {
      tab, action, subAction, theme, fullscreen,
    }, updateHash,
  } = usePreviewState();
  // const [websocketsServer, setWebsocketsServer] = useState(WEBSOCKET_SERVER_URL);

  useEffect(() => {
    document.title = 'Tokens Studio for Figma – Web Preview';
    // if (tab && tab !== 'loading') {
    if (action) {
      if (mockActions[action][subAction]) {
        dispatchMockMessage(mockActions[action][subAction]);
      } else if (mockActions[action]) {
        dispatchMockMessage(mockActions[action]);
      }
    }
    if (theme) {
      setFigmaBrowserTheme(theme, updateHash);
    }
    if (tab) {
      dispatch.uiState.setActiveTab(Tabs[tab]);
    }
  }, []);

  useEffect(() => {
    if (uiState.activeTab && tab !== uiState.activeTab) {
      updateHash({
        tab: uiState.activeTab,
      });
    }
  }, [uiState.activeTab, tab, updateHash]);

  const onThemeSelected = useCallback((type) => () => {
    setFigmaBrowserTheme(type, updateHash);
  }, []);
  const onActionSelected = React.useCallback(
    (type: string) => () => {
      if (type === 'CUSTOM') {
        setMockMessageModalOpen(type);
      } else {
        const message = mockActions[type]?.type ? mockActions[type] : mockActions[type].default;
        if (message) {
          dispatchMockMessage(message);
          updateHash({
            action: mockActions[type]?.type ? type : `${type}.default`,
          });
        }
      }
    },
    [],
  );

  const handleCloseCustomModal = useCallback(() => {
    setMockMessageModalOpen('');
  }, []);
  // const resetApp = useCallback(() => {
  //   store.dispatch({ type: 'RESET_APP' });
  // }, []);

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
        gap: '$3',
      }}
    >
      <Text css={{ fontSize: '$large' }}>Web Preview</Text>
      <Stack css={{ flex: 1 }}><span /></Stack>
      {mockMessageModalOpen && <PreviewMockMessageModal type={mockMessageModalOpen} handleClose={handleCloseCustomModal} />}
      {/* <Button onClick={resetApp}>
        RESET
      </Button> */}
      <DropdownMenu>
        <DropdownMenu.Trigger asChild data-testid="add-storage-item-dropdown">
          <Button asDropdown>
            Theme
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="bottom"
            className="content scroll-container"
          >
            {
            Object.keys(themes).map((type) => (
              <DropdownMenu.Item
                key={type}
                onSelect={onThemeSelected(type)}
                css={{ display: 'flex', gap: '$3' }}
              >
                {themes[type]}
              </DropdownMenu.Item>
            ))
          }
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild data-testid="add-storage-item-dropdown">
          <Button asDropdown>
            Mock Actions
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="bottom"
            className="content scroll-container"
          >
            {
            [{ type: 'STARTUP' }, { type: 'CUSTOM' }].map((action) => (
              <DropdownMenu.Item
                key={action.type}
                onSelect={onActionSelected(action.type)}
                css={{ display: 'flex', gap: '$3' }}
              >
                {action.type}
              </DropdownMenu.Item>
            ))
          }
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
      <Stack
        direction="row"
        css={{
          paddingTop: '$2',
          paddingBottom: '$2',
          paddingLeft: '$3',
          paddingRight: '$3',
          height: '$7',
          alignItems: 'center',
          border: `1px solid ${isConnected ? '$successFg' : '$dangerFg'}`,
          backgroundColor: isConnected ? '$successBg' : '$dangerBg',
          borderRadius: '$small',
        }}
      >
        <Text css={{ fontSize: '$base', color: isConnected ? '$successFg' : '$dangerFg' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </Stack>
    </Stack>
  );

  return (
    <Box css={{
      justifyContent: 'center', alignItems: 'center', padding: '$7', backgroundColor: '$bgSubtle', height: '100vh',
    }}
    >
      {PREVIEW_ENV === 'browser' ? (
        <>
          {previewHeader}
          <PreviewPluginWindow
            height={fullscreen ? '100%' : settings.uiWindow?.height}
            width={fullscreen ? '100%' : settings.uiWindow?.width}
            css={fullscreen ? {
              height: '100%',
              width: '100%',
              position: 'fixed',
              top: 0,
              left: 0,
            } : undefined}
            fullscreen={fullscreen}
            updateHash={updateHash}
          >
            {children}
          </PreviewPluginWindow>
        </>
      ) : (
        <>
          {previewHeader}
          {/* <Stack
            css={{
              color: '$fgMuted',
              backgroundColor: '$bgSurface',
              padding: '$4',
              borderRadius: '$medium',
              marginBottom: '$7',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '$3',
            }}
          >
            <Stack direction="row">
              <Label htmlFor="websocketconnect">WebSockets Server</Label>
              <TextInput
                autoFocus
                value={websocketsServer} // eslint-disable-next-line
                onChange={(e) => {
                  setWebsocketsServer(e.target.value);
                }}
                type="text"
                name="websocketconnect"
                data-testid="websocket-connect"
                required
              />
              <Button>Connect</Button>
            </Stack>
          </Stack> */}
        </>
      )}
    </Box>
  );
}

export default PreviewApp;
