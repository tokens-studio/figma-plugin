import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@tokens-studio/ui';
import Box from './Box';
import { Tabs } from '@/constants/Tabs';
import Stack from './Stack';
import { TabButton } from './TabButton';
import { NavbarUndoButton } from './NavbarUndoButton';
import Minimize from '@/icons/minimize.svg';
import useMinimizeWindow from './useMinimizeWindow';
import { activeTabSelector } from '@/selectors';
import { Dispatch } from '../store';
import TokenFlowButton from './TokenFlowButton';

const Navbar: React.FC<React.PropsWithChildren<React.PropsWithChildren<unknown>>> = () => {
  const activeTab = useSelector(activeTabSelector);
  const dispatch = useDispatch<Dispatch>();
  const { handleResize } = useMinimizeWindow();
  const { t } = useTranslation(['navbar']);

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
          <TabButton name={Tabs.TOKENS} activeTab={activeTab} label={t('tokens')} onSwitch={handleSwitch} />
          <TabButton name={Tabs.INSPECTOR} activeTab={activeTab} label={t('inspect')} onSwitch={handleSwitch} />
          <TabButton name={Tabs.SETTINGS} activeTab={activeTab} label={t('settings')} onSwitch={handleSwitch} />
        </Stack>
        <NavbarUndoButton />
      </Stack>
      <Stack direction="row" align="center" justify="end" gap={1} css={{ paddingRight: '$2', flexBasis: 'min-content' }}>
        {/* Second screen icon removed */}
        <TokenFlowButton />
        <IconButton size="small" variant="invisible" tooltip={t('minimize') as string} onClick={handleResize} icon={<Minimize />} />
      </Stack>
    </Box>
  );
};

export default Navbar;
