import React, { useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Box from './Box';
import { Tabs } from '@/constants/Tabs';
import Stack from './Stack';
import { TabButton } from './TabButton';
import { NavbarUndoButton } from './NavbarUndoButton';
import Minimize from '../assets/minimize.svg';
import useMinimizeWindow from './useMinimizeWindow';
import IconButton from './IconButton';
import { IconFolder } from '@/icons';
import useTokens from '@/app/store/useTokens';
import {
  themeObjectsSelector, activeThemeSelector, themeOptionsSelector, usedTokenSetSelector,
} from '@/selectors';

const Navbar: React.FC = () => {
  const { handleResize } = useMinimizeWindow();
  const { getFormattedTokens } = useTokens();
  const activeTheme = useSelector(activeThemeSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const themeObjects = useSelector(themeObjectsSelector);

  const handleOpenTokenFlowApp = useCallback(async () => {
    const tokens = getFormattedTokens({
      includeAllTokens: true,
      includeParent: false,
      expandTypography: false,
      expandShadow: false,
      expandComposition: false,
    });
    const tokenData = JSON.stringify(tokens, null, 2);
    const response = await axios({
      method: 'post',
      url: 'http://localhost:3000/api/tokens',
      data: {
        tokenData,
        activeTheme,
        availableThemes,
        usedTokenSet,
        themeObjects,
      },
    });
    if (response.status === 200) window.open(`http://localhost:3000?id=${response.data.result}`);
  }, [activeTheme, availableThemes, getFormattedTokens, themeObjects, usedTokenSet]);

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
      <IconButton tooltip="open tokenflow app" onClick={handleOpenTokenFlowApp} icon={<IconFolder />} />
      <Stack direction="row" align="center">
        <IconButton tooltip="Minimize plugin" onClick={handleResize} icon={<Minimize />} />
      </Stack>
    </Box>
  );
};

export default Navbar;
