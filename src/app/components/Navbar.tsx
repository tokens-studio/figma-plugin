import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import convertTokensToObject from '@/utils/convertTokensToObject';
import Icon from './Icon';
import Tooltip from './Tooltip';
import useRemoteTokens from '../store/remoteTokens';
import { StorageProviderType } from '../../types/api';
import { RootState, Dispatch } from '../store';
import Box from './Box';
import { styled } from '@/stitches.config';

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

function TabButton({ name, label, first = false }) {
  const { activeTab } = useSelector((state: RootState) => state.uiState);
  const dispatch = useDispatch<Dispatch>();

  const onClick = () => {
    track('Switched tab', { from: activeTab, to: name });
    dispatch.uiState.setActiveTab(name);
  };

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
  const { projectURL, storageType } = useSelector((state: RootState) => state.uiState);
  const { lastSyncedState, tokens, editProhibited } = useSelector((state: RootState) => state.tokenState);
  const { pullTokens, pushTokens } = useRemoteTokens();

  const checkForChanges = () => {
    if (lastSyncedState !== JSON.stringify(convertTokensToObject(tokens), null, 2)) {
      return true;
    }
  };

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
        <TabButton name="syncsettings" label="Sync" />
        <TabButton name="settings" label="Settings" />
      </div>
      <div className="flex flex-row items-center">
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
                  {checkForChanges() && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-icon-brand" />}

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
      </div>
    </Box>
  );
}

export default Navbar;
