import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link1Icon, LinkBreak1Icon } from '@radix-ui/react-icons';
import Box from './Box';
import { Tabs } from '@/constants/Tabs';
import Stack from './Stack';
import { TabButton } from './TabButton';
import { NavbarUndoButton } from './NavbarUndoButton';
import Minimize from '@/icons/minimize.svg';
import useMinimizeWindow from './useMinimizeWindow';
import IconButton from './IconButton';
import { activeTabSelector } from '@/selectors';
import { Dispatch } from '../store';
import TokenFlowButton from './TokenFlowButton';
import { secondScreenSelector } from '@/selectors/secondScreenSelector';

const Navbar: React.FC = () => {
  const activeTab = useSelector(activeTabSelector);
  const secondScreenisEnabled = useSelector(secondScreenSelector);
  const dispatch = useDispatch<Dispatch>();
  const { handleResize } = useMinimizeWindow();

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
      <Stack gap={0} direction="row" align="center" justify="between">
        <Stack gap={0} direction="row" align="center" justify="start">
          <TabButton name={Tabs.TOKENS} activeTab={activeTab} label="Tokens" onSwitch={handleSwitch} />
          <TabButton name={Tabs.INSPECTOR} activeTab={activeTab} label="Inspect" onSwitch={handleSwitch} />
          <TabButton name={Tabs.SETTINGS} activeTab={activeTab} label="Settings" onSwitch={handleSwitch} />
        </Stack>
        <NavbarUndoButton />
      </Stack>
      <Stack direction="row" align="center" justify="end" gap={1} css={{ paddingRight: '$2', flexBasis: 'min-content' }}>
        <TabButton endEnhancer={<Box css={{ color: secondScreenisEnabled ? '$fgSuccess' : '$dangerFg' }}>{secondScreenisEnabled ? <Link1Icon /> : <LinkBreak1Icon />}</Box>} name={Tabs.SECONDSCREEN} activeTab={activeTab} label="Second Screen" onSwitch={handleSwitch} />
        <TokenFlowButton />
        <IconButton size="large" tooltip="Minimize plugin" onClick={handleResize} icon={<Minimize />} />
      </Stack>
    </Box>
  );
};

export default Navbar;
