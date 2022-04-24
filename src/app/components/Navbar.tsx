import React, { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Icon from './Icon';
import Tooltip from './Tooltip';
import useRemoteTokens from '../store/remoteTokens';
import { StorageProviderType } from '../../types/api';
import Box from './Box';
import {
  editProhibitedSelector,
  lastSyncedStateSelector,
  projectURLSelector,
  storageTypeSelector,
  themesListSelector,
  tokensSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { Tabs } from '@/constants/Tabs';
import Stack from './Stack';
import { TabButton } from './TabButton';
import { NavbarUndoButton } from './NavbarUndoButton';

const transformProviderName = (provider: StorageProviderType) => {
  switch (provider) {
    case StorageProviderType.JSONBIN:
      return 'JSONBin.io';
    case StorageProviderType.GITHUB:
      return 'GitHub';
    case StorageProviderType.GITLAB:
      return 'GitLab';
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
  const themes = useSelector(themesListSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const lastSyncedState = useSelector(lastSyncedStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const { pullTokens, pushTokens } = useRemoteTokens();

  const hasChanges = useMemo(() => (
    lastSyncedState !== JSON.stringify([tokens, themes], null, 2)
  ), [lastSyncedState, tokens, themes]);
  const handlePushClick = useCallback(() => {
    pushTokens();
  }, [pushTokens]);

  const handlePullTokens = useCallback(() => {
    pullTokens({ usedTokenSet });
  }, [pullTokens, usedTokenSet]);

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
        <NavbarUndoButton />
      </Stack>
      <Stack direction="row" align="center">
        {storageType.provider !== StorageProviderType.LOCAL && (
          <>
            {storageType.provider === StorageProviderType.JSONBIN && (
              <Tooltip label={`Go to ${transformProviderName(storageType.provider)}`}>
                <a href={projectURL} target="_blank" rel="noreferrer" className="block button button-ghost">
                  <Icon name="library" />
                </a>
              </Tooltip>
            )}
            {(storageType.provider === StorageProviderType.GITHUB
              || storageType.provider === StorageProviderType.GITLAB) && (
              <Tooltip label={`Push to ${transformProviderName(storageType.provider)}`}>
                <button
                  onClick={handlePushClick}
                  type="button"
                  className="relative button button-ghost"
                  disabled={editProhibited}
                >
                  {hasChanges && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary-500" />}
                  <Icon name="library" />
                </button>
              </Tooltip>
            )}

            <Tooltip label={`Pull from ${transformProviderName(storageType.provider)}`}>
              <button onClick={handlePullTokens} type="button" className="button button-ghost">
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
