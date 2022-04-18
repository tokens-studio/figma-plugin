import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckIcon, SizeIcon, MarginIcon } from '@radix-ui/react-icons';
import convertTokensToObject from '@/utils/convertTokensToObject';
import Icon from './Icon';
import Tooltip from './Tooltip';
import useRemoteTokens from '../store/remoteTokens';
import { StorageProviderType } from '../../types/api';
import Box from './Box';
import { Dispatch } from '../store';
import { styled } from '@/stitches.config';
import {
  editProhibitedSelector,
  lastSyncedStateSelector,
  projectURLSelector,
  storageTypeSelector,
  tokensSelector,
  windowSizeSelector,
} from '@/selectors';
import { Tabs } from '@/constants/Tabs';
import Stack from './Stack';
import { TabButton } from './TabButton';
import { NavbarUndoButton } from './NavbarUndoButton';
import MinimiseIcon from '../assets/minimiseIcon.svg';
import MaximiseIcon from '../assets/maximiseIcon.svg';

const transformProviderName = (provider) => {
  switch (provider) {
    case StorageProviderType.JSONBIN:
      return 'JSONBin.io';
    case StorageProviderType.GITHUB:
      return 'GitHub';
    case StorageProviderType.URL:
      return 'URL';
    default:
      return provider;
  }
};

export const Navbar: React.FC = () => {
  const projectURL = useSelector(projectURLSelector);
  const storageType = useSelector(storageTypeSelector);
  const tokens = useSelector(tokensSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const lastSyncedState = useSelector(lastSyncedStateSelector);
  const windowSize = useSelector(windowSizeSelector);
  const { pullTokens, pushTokens } = useRemoteTokens();

  const dispatch = useDispatch<Dispatch>();

  const StyledButton = styled('button', {
    all: 'unset',
    border: 'none',
    padding: '$1',
    marginRight: '10px',
    borderRadius: '$button',
    cursor: 'pointer',
    '&:hover, &:focus': {
      boxShadow: 'none',
    },
  });

  const handleMinimize = React.useCallback(() => {
    if (windowSize) {
      dispatch.settings.setMinimizePluginWindow({
        width: windowSize.width,
        height: windowSize.height,
        isMinimized: !windowSize.isMinimized,
      });
      dispatch.settings.setWindowSize({
        width: windowSize.isMinimized ? windowSize.storedWidth : 400,
        height: windowSize.isMinimized ? windowSize.storedHeight : 50,
      });
    }
  }, [dispatch, windowSize]);

  const checkForChanges = React.useCallback(() => {
    if (lastSyncedState !== JSON.stringify(convertTokensToObject(tokens), null, 2)) {
      return true;
    }
    return false;
  }, [lastSyncedState, tokens]);

  return (
    <Box
      css={{
        position: 'sticky',
        top: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '$bgDefault',
        borderBottom: '1px solid $borderMuted',
        zIndex: 1,
        transform: 'translateY(-1px)',
      }}
    >
      <Stack gap={0} direction="row" align="center" justify="between" css={{ width: '100%' }}>
        <div>
          <TabButton name={Tabs.TOKENS} label="Tokens" />
          <TabButton name={Tabs.INSPECTOR} label="Inspect" />
          <TabButton name={Tabs.SYNCSETTINGS} label="Sync" />
          <TabButton name={Tabs.SETTINGS} label="Settings" />
        </div>
        <StyledButton type="button" onClick={handleMinimize} buttonVariant="primary">
          {windowSize && !windowSize.isMinimized ? <MinimiseIcon /> : <MaximiseIcon />}
        </StyledButton>
        <NavbarUndoButton />
      </Stack>
      <Stack direction="row" align="center">
        {storageType.provider !== StorageProviderType.LOCAL && (
          <>
            {storageType.provider === StorageProviderType.JSONBIN && (
              <Tooltip variant="right" label={`Go to ${transformProviderName(storageType.provider)}`}>
                <a href={projectURL} target="_blank" rel="noreferrer" className="block button button-ghost">
                  <Icon name="library" />
                </a>
              </Tooltip>
            )}
            {storageType.provider === StorageProviderType.GITHUB && (
              <Tooltip variant="right" label={`Push to ${transformProviderName(storageType.provider)}`}>
                <button
                  onClick={() => pushTokens()}
                  type="button"
                  className="relative button button-ghost"
                  disabled={editProhibited}
                >
                  {checkForChanges() && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary-500" />}

                  <Icon name="library" />
                </button>
              </Tooltip>
            )}

            <Tooltip variant="right" label={`Pull from ${transformProviderName(storageType.provider)}`}>
              <button onClick={() => pullTokens()} type="button" className="button button-ghost">
                <Icon name="refresh" />
              </button>
            </Tooltip>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default Navbar;
