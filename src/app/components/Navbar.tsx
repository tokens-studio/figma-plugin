import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import convertTokensToObject from '@/utils/convertTokensToObject';
import Icon from './Icon';
import Tooltip from './Tooltip';
import useRemoteTokens from '../store/remoteTokens';
import { StorageProviderType } from '../../types/api';
import { Dispatch } from '../store';
import Box from './Box';
import { styled } from '@/stitches.config';
import {
  activeTabSelector, editProhibitedSelector, lastSyncedStateSelector, projectURLSelector, storageTypeSelector, tokensSelector,
} from '@/selectors';
import { Tabs } from '@/constants/Tabs';
import Stack from './Stack';

const StyledButton = styled('button', {
  padding: '$5 $4',
  fontSize: '$xsmall',
  fontWeight: '$bold',
  cursor: 'pointer',
  color: '$textMuted',
  '&:focus, &:hover': {
    outline: 'none',
    boxShadow: 'none',
    color: '$text',
  },
  variants: {
    isActive: {
      true: {
        color: '$text',
      },
    },
  },
});

type Props = {
  name: Tabs
  label: string
};

function TabButton({ name, label }: Props) {
  const activeTab = useSelector(activeTabSelector);
  const dispatch = useDispatch<Dispatch>();

  const onClick = React.useCallback(() => {
    track('Switched tab', { from: activeTab, to: name });
    dispatch.uiState.setActiveTab(name);
  }, [activeTab, name, dispatch.uiState]);

  return (
    <StyledButton
      data-cy={`navitem-${name}`}
      type="button"
      isActive={activeTab === name}
      name="text"
      onClick={onClick}
    >
      {label}
    </StyledButton>
  );
}

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

function Navbar() {
  const projectURL = useSelector(projectURLSelector);
  const storageType = useSelector(storageTypeSelector);
  const tokens = useSelector(tokensSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const lastSyncedState = useSelector(lastSyncedStateSelector);
  const { pullTokens, pushTokens } = useRemoteTokens();

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
      <div>
        <TabButton first name="tokens" label="Tokens" />
        <TabButton name="inspector" label="Inspect" />
        <TabButton name="settings" label="Settings" />
      </div>
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
}

export default Navbar;
