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
  selectedExportThemes: [],
};

// Sample token data for different examples
const sampleBasicTokens = {
  colors: {
    primary: { $value: '#2563eb', $type: 'color' },
    secondary: { $value: '#64748b', $type: 'color' },
    success: { $value: '#059669', $type: 'color' },
    danger: { $value: '#dc2626', $type: 'color' },
    'bg-primary': { $value: '#ffffff', $type: 'color' },
    'bg-secondary': { $value: '#f8fafc', $type: 'color' },
  },
  spacing: {
    xs: { $value: '4px', $type: 'spacing' },
    sm: { $value: '8px', $type: 'spacing' },
    md: { $value: '16px', $type: 'spacing' },
    lg: { $value: '24px', $type: 'spacing' },
    xl: { $value: '32px', $type: 'spacing' },
  },
  typography: {
    'heading-lg': {
      $value: { fontFamily: 'Inter', fontSize: '24px', fontWeight: '700' },
      $type: 'typography',
    },
    'body-md': {
      $value: { fontFamily: 'Inter', fontSize: '16px', fontWeight: '400' },
      $type: 'typography',
    },
    'caption-sm': {
      $value: { fontFamily: 'Inter', fontSize: '12px', fontWeight: '400' },
      $type: 'typography',
    },
  },
};

const sampleComplexTokens = {
  'core/colors': {
    'blue-50': { $value: '#eff6ff', $type: 'color' },
    'blue-100': { $value: '#dbeafe', $type: 'color' },
    'blue-500': { $value: '#3b82f6', $type: 'color' },
    'blue-900': { $value: '#1e3a8a', $type: 'color' },
    'gray-50': { $value: '#f9fafb', $type: 'color' },
    'gray-100': { $value: '#f3f4f6', $type: 'color' },
    'gray-500': { $value: '#6b7280', $type: 'color' },
    'gray-900': { $value: '#111827', $type: 'color' },
  },
  'semantic/colors': {
    'text-primary': { $value: '{core/colors.gray-900}', $type: 'color' },
    'text-secondary': { $value: '{core/colors.gray-500}', $type: 'color' },
    'bg-primary': { $value: '{core/colors.blue-500}', $type: 'color' },
    'bg-surface': { $value: '{core/colors.gray-50}', $type: 'color' },
    'border-default': { $value: '{core/colors.gray-100}', $type: 'color' },
  },
  'component/button': {
    'primary-bg': { $value: '{semantic/colors.bg-primary}', $type: 'color' },
    'primary-text': { $value: '#ffffff', $type: 'color' },
    'secondary-bg': { $value: 'transparent', $type: 'color' },
    'secondary-text': { $value: '{semantic/colors.text-primary}', $type: 'color' },
    'secondary-border': { $value: '{semantic/colors.border-default}', $type: 'color' },
  },
};

const sampleThemes = [
  {
    id: 'light',
    name: 'Light Theme',
    selectedTokenSets: {
      colors: 'enabled',
      spacing: 'enabled',
      typography: 'enabled',
    },
  },
  {
    id: 'dark',
    name: 'Dark Theme',
    selectedTokenSets: {
      colors: 'enabled',
      spacing: 'enabled',
      typography: 'enabled',
    },
  },
];

// Create different startup scenarios for various use cases
const mockActions = {
  STARTUP: {
    default: mockStartupParams,
  },
  // Fresh start - no tokens loaded
  FRESH_START: {
    type: AsyncMessageTypes.STARTUP,
    activeTheme: {},
    lastOpened: Date.now(),
    initialLoad: true,
    usedEmail: null,
    authData: null,
    onboardingExplainer: {
      sets: false,
      exportSets: false,
      inspect: false,
      syncProviders: false,
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
    selectedExportThemes: [],
  },
  // Basic tokens loaded
  WITH_BASIC_TOKENS: {
    type: AsyncMessageTypes.STARTUP,
    activeTheme: { light: 'enabled' },
    lastOpened: Date.now(),
    initialLoad: false,
    usedEmail: null,
    authData: null,
    onboardingExplainer: {
      sets: true,
      exportSets: false,
      inspect: false,
      syncProviders: false,
    },
    localApiProviders: [],
    settings: mockSettings,
    storageType: {
      provider: StorageProviderType.LOCAL,
    },
    user: mockUser,
    localTokenData: {
      activeTheme: 'light',
      checkForChanges: true,
      themes: sampleThemes,
      usedTokenSet: { colors: true, spacing: true, typography: true },
      updatedAt: new Date().toISOString(),
      values: sampleBasicTokens,
      collapsedTokenSets: null,
      tokenFormat: TokenFormatOptions.Legacy,
      version: '91',
    },
    selectedExportThemes: ['light'],
  },
  // Complex multi-level tokens with themes
  WITH_COMPLEX_TOKENS: {
    type: AsyncMessageTypes.STARTUP,
    activeTheme: { 'light-theme': 'enabled' },
    lastOpened: Date.now(),
    initialLoad: false,
    usedEmail: null,
    authData: null,
    onboardingExplainer: {
      sets: true,
      exportSets: true,
      inspect: true,
      syncProviders: false,
    },
    localApiProviders: [],
    settings: mockSettings,
    storageType: {
      provider: StorageProviderType.LOCAL,
    },
    user: mockUser,
    localTokenData: {
      activeTheme: 'light-theme',
      checkForChanges: true,
      themes: [
        {
          id: 'light-theme',
          name: 'Light Theme',
          selectedTokenSets: {
            'core/colors': 'source',
            'semantic/colors': 'enabled',
            'component/button': 'enabled',
          },
        },
        {
          id: 'dark-theme',
          name: 'Dark Theme',
          selectedTokenSets: {
            'core/colors': 'source',
            'semantic/colors': 'enabled',
            'component/button': 'enabled',
          },
        },
      ],
      usedTokenSet: { 'core/colors': true, 'semantic/colors': true, 'component/button': true },
      updatedAt: new Date().toISOString(),
      values: sampleComplexTokens,
      collapsedTokenSets: { 'semantic/colors': false },
      tokenFormat: TokenFormatOptions.Legacy,
      version: '91',
    },
    selectedExportThemes: ['light-theme', 'dark-theme'],
  },
  // With GitHub sync configured
  WITH_GITHUB_SYNC: {
    type: AsyncMessageTypes.STARTUP,
    activeTheme: { main: 'enabled' },
    lastOpened: Date.now(),
    initialLoad: false,
    usedEmail: 'developer@example.com',
    authData: {
      id: 'github-auth',
      provider: 'github',
      secret: 'mock-token',
    },
    onboardingExplainer: {
      sets: true,
      exportSets: true,
      inspect: true,
      syncProviders: true,
    },
    localApiProviders: [
      {
        provider: 'github',
        id: 'github-sync',
        name: 'Design Tokens Repo',
        secret: 'mock-github-token',
      },
    ],
    settings: mockSettings,
    storageType: {
      provider: StorageProviderType.GITHUB,
      id: 'github-sync',
      name: 'Design Tokens Repo',
      owner: 'design-team',
      repository: 'design-tokens',
      branch: 'main',
      filePath: 'tokens.json',
    },
    user: mockUser,
    localTokenData: {
      activeTheme: 'main',
      checkForChanges: true,
      themes: [
        {
          id: 'main',
          name: 'Main Theme',
          selectedTokenSets: {
            foundation: 'enabled',
            semantic: 'enabled',
            components: 'enabled',
          },
        },
      ],
      usedTokenSet: { foundation: true, semantic: true, components: true },
      updatedAt: new Date().toISOString(),
      values: sampleComplexTokens,
      collapsedTokenSets: null,
      tokenFormat: TokenFormatOptions.DTCG,
      version: '91',
    },
    selectedExportThemes: ['main'],
  },
  // Inspector mode with selection
  INSPECTOR_MODE: {
    type: AsyncMessageTypes.STARTUP,
    activeTheme: { design: 'enabled' },
    lastOpened: Date.now(),
    initialLoad: false,
    usedEmail: null,
    authData: null,
    onboardingExplainer: {
      sets: true,
      exportSets: true,
      inspect: true,
      syncProviders: false,
    },
    localApiProviders: [],
    settings: {
      ...mockSettings,
      inspectDeep: true,
    },
    storageType: {
      provider: StorageProviderType.LOCAL,
    },
    user: mockUser,
    localTokenData: {
      activeTheme: 'design',
      checkForChanges: true,
      themes: sampleThemes,
      usedTokenSet: { colors: true, spacing: true, typography: true },
      updatedAt: new Date().toISOString(),
      values: sampleBasicTokens,
      collapsedTokenSets: null,
      tokenFormat: TokenFormatOptions.Legacy,
      version: '91',
    },
    selectedExportThemes: ['design'],
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
    FRESH_START: JSON.stringify(mockActions.FRESH_START, null, 2),
    WITH_BASIC_TOKENS: JSON.stringify(mockActions.WITH_BASIC_TOKENS, null, 2),
    WITH_COMPLEX_TOKENS: JSON.stringify(mockActions.WITH_COMPLEX_TOKENS, null, 2),
    WITH_GITHUB_SYNC: JSON.stringify(mockActions.WITH_GITHUB_SYNC, null, 2),
    INSPECTOR_MODE: JSON.stringify(mockActions.INSPECTOR_MODE, null, 2),
    DEFAULT: '',
  }[type || 'DEFAULT'] || '');
  const [error, setError] = useState('');
  const handleJsonEditChange = useCallback((val) => {
    try {
      JSON.parse(val);
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

  useEffect(() => {
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
  }, [updateHash]);
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
    [updateHash],
  );

  const onQuickLinkClick = React.useCallback((hash: string) => () => {
    window.location.hash = hash;
  }, []);

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
            [
              { type: 'STARTUP', label: 'Default Startup' },
              { type: 'FRESH_START', label: 'Fresh Start (No Tokens)' },
              { type: 'WITH_BASIC_TOKENS', label: 'Basic Design Tokens' },
              { type: 'WITH_COMPLEX_TOKENS', label: 'Complex Token System' },
              { type: 'WITH_GITHUB_SYNC', label: 'GitHub Sync Setup' },
              { type: 'INSPECTOR_MODE', label: 'Inspector Mode' },
              { type: 'CUSTOM', label: 'Custom JSON...' },
            ].map((mockAction) => (
              <DropdownMenu.Item
                key={mockAction.type}
                onSelect={onActionSelected(mockAction.type)}
                css={{ display: 'flex', gap: '$3' }}
              >
                {mockAction.label}
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

          {/* Quick Preview Links */}
          <Stack
            direction="column"
            gap={3}
            css={{
              color: '$fgMuted',
              backgroundColor: '$bgSubtle',
              padding: '$4',
              borderRadius: '$medium',
              marginBottom: '$4',
              border: '1px solid $borderMuted',
            }}
          >
            <Text css={{ fontSize: '$large', fontWeight: '$semibold' }}>Quick Start Examples</Text>
            <Text css={{ fontSize: '$small', color: '$fgMuted' }}>
              Click these links to quickly preview different plugin states. Useful for testing, screenshots, and development.
            </Text>
            <Stack direction="column" gap={2}>
              <Stack direction="row" gap={3} css={{ flexWrap: 'wrap' }}>
                {[
                  { hash: '#tab=start&action=FRESH_START', label: 'Fresh Start' },
                  { hash: '#tab=tokens&action=WITH_BASIC_TOKENS', label: 'Tokens Tab' },
                  { hash: '#tab=inspector&action=INSPECTOR_MODE', label: 'Inspector' },
                  { hash: '#tab=json&action=WITH_COMPLEX_TOKENS', label: 'JSON Editor' },
                  { hash: '#tab=settings&action=WITH_GITHUB_SYNC', label: 'Settings' },
                ].map(({ hash, label }) => (
                  <Button
                    key={hash}
                    variant="secondary"
                    size="small"
                    onClick={onQuickLinkClick(hash)}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
              <Stack direction="row" gap={3} css={{ flexWrap: 'wrap' }}>
                {[
                  { hash: '#tab=tokens&action=WITH_COMPLEX_TOKENS&theme=dark', label: '🌙 Dark Theme' },
                  { hash: '#tab=tokens&action=WITH_COMPLEX_TOKENS&fullscreen=true', label: '🔍 Fullscreen' },
                  { hash: '#tab=tokens&action=WITH_GITHUB_SYNC&theme=system', label: '🔄 GitHub Sync' },
                ].map(({ hash, label }) => (
                  <Button
                    key={hash}
                    variant="invisible"
                    size="small"
                    onClick={onQuickLinkClick(hash)}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Stack>

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
