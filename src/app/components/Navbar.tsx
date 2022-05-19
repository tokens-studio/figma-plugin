import React from 'react';
import Box from './Box';
import { Tabs } from '@/constants/Tabs';
import Stack from './Stack';
import { TabButton } from './TabButton';
import { NavbarUndoButton } from './NavbarUndoButton';
import Minimize from '../assets/minimize.svg';
import useMinimizeWindow from './useMinimizeWindow';
import IconButton from './IconButton';

const Navbar: React.FC = () => {
  const { handleResize } = useMinimizeWindow();

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
        <IconButton tooltip="Minimize plugin" onClick={handleResize} icon={<Minimize />} />
      </Stack>
    </Box>
  );
};

export default Navbar;
