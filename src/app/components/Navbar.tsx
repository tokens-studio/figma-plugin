import React, { useCallback } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { LightningBoltIcon } from '@radix-ui/react-icons';
import Box from './Box';
import { Tabs } from '@/constants/Tabs';
import Stack from './Stack';
import { TabButton } from './TabButton';
import { NavbarUndoButton } from './NavbarUndoButton';
import Minimize from '../assets/minimize.svg';
import useMinimizeWindow from './useMinimizeWindow';
import IconButton from './IconButton';
import {
  themeObjectsSelector,
  activeThemeSelector,
  themeOptionsSelector,
  usedTokenSetSelector,
  tokensSelector,
  activeTabSelector,
} from '@/selectors';

import { Dispatch } from '../store';

const Navbar: React.FC = () => {
  const activeTab = useSelector(activeTabSelector);
  const dispatch = useDispatch<Dispatch>();
  const { handleResize } = useMinimizeWindow();
  const activeTheme = useSelector(activeThemeSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const themeObjects = useSelector(themeObjectsSelector);
  const tokens = useSelector(tokensSelector);

  const handleOpenTokenFlowApp = useCallback(async () => {
    const tokenData = JSON.stringify(tokens, null, 2);
    const response = await axios({
      method: 'post',
      url: 'https://token-flow-app.herokuapp.com/api/tokens',
      data: {
        tokenData,
        activeTheme,
        availableThemes,
        usedTokenSet,
        themeObjects,
      },
    });
    if (response.status === 200) window.open(`https://token-flow-app.herokuapp.com?id=${response.data.result}`);
  }, [activeTheme, availableThemes, themeObjects, tokens, usedTokenSet]);

  const handleSwitch = useCallback(
    (tab: Tabs) => {
      dispatch.uiState.setActiveTab(tab);
    },
    [dispatch.uiState],
  );

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
          <TabButton name={Tabs.TOKENS} activeTab={activeTab} label="Tokens" onSwitch={handleSwitch} />
          <TabButton name={Tabs.INSPECTOR} activeTab={activeTab} label="Inspect" onSwitch={handleSwitch} />
          <TabButton name={Tabs.SETTINGS} activeTab={activeTab} label="Settings" onSwitch={handleSwitch} />
        </div>
        <NavbarUndoButton />
      </Stack>
      <IconButton tooltip="open tokenflow app" onClick={handleOpenTokenFlowApp} icon={<LightningBoltIcon />} />
      <Stack direction="row" align="center">
        <IconButton tooltip="Minimize plugin" onClick={handleResize} icon={<Minimize />} />
      </Stack>
    </Box>
  );
};

export default Navbar;
