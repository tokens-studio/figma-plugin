import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import Icon from './Icon';
import Tooltip from './Tooltip';
import useRemoteTokens from '../store/remoteTokens';
import { StorageProviderType } from '../../types/api';
import Box from './Box';
import { styled } from '@/stitches.config';
import {
  projectURLSelector,
  storageTypeSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { Tabs } from '@/constants/Tabs';
import Stack from './Stack';
import { TabButton } from './TabButton';
import { NavbarUndoButton } from './NavbarUndoButton';
import Minimize from '../assets/minimize.svg';
import useMinimizeWindow from './useMinimizeWindow';

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

const StyledButton = styled('button', {
  all: 'unset',
  border: 'none',
  padding: '$1',
  marginRight: '$3',
  borderRadius: '$button',
  cursor: 'pointer',
});

const Navbar: React.FC = () => {
  const projectURL = useSelector(projectURLSelector);
  const storageType = useSelector(storageTypeSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const { handleResize } = useMinimizeWindow();

  const { pullTokens } = useRemoteTokens();

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
          <TabButton name={Tabs.SETTINGS} label="Settings" />
        </div>
        <NavbarUndoButton />
      </Stack>
      <Stack direction="row" align="center">
        {storageType.provider !== StorageProviderType.LOCAL
        && storageType.provider !== StorageProviderType.GITHUB
        && (
          <>
            {storageType.provider === StorageProviderType.JSONBIN && (
              <Tooltip label={`Go to ${transformProviderName(storageType.provider)}`}>
                <a href={projectURL} target="_blank" rel="noreferrer" className="block button button-ghost">
                  <Icon name="library" />
                </a>
              </Tooltip>
            )}
            <Tooltip label={`Pull from ${transformProviderName(storageType.provider)}`}>
              <button onClick={handlePullTokens} type="button" className="button button-ghost">
                <Icon name="refresh" />
              </button>
            </Tooltip>
          </>
        )}
        <Tooltip label="Minimize plugin">
          <StyledButton type="button" onClick={handleResize}>
            <Minimize />
          </StyledButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default Navbar;
