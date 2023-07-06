import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Link1Icon, LinkBreak1Icon, ExitIcon,
} from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import Box from '../Box';
import Stack from '../Stack';
import { secondScreenSelector } from '@/selectors/secondScreenSelector';
import { Dispatch } from '@/app/store';
import { styled } from '@/stitches.config';
import { track } from '@/utils/analytics';
import { Switch, SwitchThumb } from '../Switch';
import Button from '../Button';
import { IconSecondScreen } from '@/icons';

export const StyledBetaBadge = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$xxsmall',
  padding: '$2',
  borderRadius: '$badge',
  backgroundColor: '$bgAccent',
  lineHeight: 1,
  color: '$fgDefault',
  fontWeight: '$bold',
  textTransform: 'uppercase',
  border: '1px solid transparent',
});

const StyledP = styled('p', {
  fontWeight: '$normal',
  color: '$text',
  fontSize: '$xsmall',
});

export default function SecondScreen() {
  const { t } = useTranslation(['settings']);
  const isEnabled = useSelector(secondScreenSelector);
  const dispatch = useDispatch<Dispatch>();
  const { user, handleLogout } = useAuth();

  const onSyncClick = useCallback(() => {
    dispatch.uiState.toggleSecondScreen();
  }, [dispatch.uiState]);

  const handleOpenSecondScreen = useCallback(() => {
    track('Open second screen');
    window.open(process.env.SECOND_SCREEN_APP_URL);
  }, []);

  let statusColor;

  if (!user) {
    statusColor = '$fgSubtle';
  } else if (isEnabled && user) {
    statusColor = '$fgSuccess';
  } else {
    statusColor = '$fgDanger';
  }

  return (
    <Stack direction="column" justify="between" align="start" gap={4} css={{ padding: '$3 $3', margin: 'auto', maxWidth: 'clamp(40vw, 240px, 80vw)' }}>
      <Box css={{
        display: 'flex', flexDirection: 'column', gap: '$2', padding: '$4', border: '1px solid $borderMuted',
      }}
      >
        <Stack direction="column" gap={3} justify="between" align="start">
          <StyledBetaBadge>BETA</StyledBetaBadge>
          <StyledP>
            {t('secondScreenIsInBetaSomeFeaturesMayNotWorkAsExpected')}
          </StyledP>
        </Stack>
      </Box>

      <Stack gap={4} direction="row" align="center">
        <Switch id="syncswitch" checked={isEnabled && !!user} onCheckedChange={onSyncClick}>
          <SwitchThumb />
          {' '}

        </Switch>
        <span>{t('liveSync')}</span>
      </Stack>

      <Stack
        direction="column"
        gap={1}
        css={{
          backgroundColor: '$bgSubtle',
          borderColor: statusColor,
          borderWidth: '1px',
          padding: '$3 $5',
          fontSize: '$xsmall',
          borderRadius: '6px',
          color: statusColor,
          marginBottom: '$3',
          width: '100%',
        }}
      >
        <Stack direction="row" align="center" gap={3} css={{ fontWeight: '$sansBold' }}>
          {isEnabled && user ? <Link1Icon /> : <LinkBreak1Icon />}
          {isEnabled && user ? t('connected') : t('notConnected')}
        </Stack>
        {isEnabled && user ? t('liveSyncWithSecondScreenActive') : t('liveSyncInactive')}
        {user ? (
          <Box css={{
            fontWeight: '$sansRegular', fontSize: '$xsmall', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
          >
            {t('signedInAs')}
            {' '}
            {user.email}
          </Box>
        )
          : (
            <Box css={{
              fontWeight: '$sansRegular', fontSize: '$xsmall', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
            >
              <Button variant="ghost" size="small" icon={<ExitIcon />} onClick={onSyncClick}>
                {t('signInToContinue')}
              </Button>
            </Box>
          )}
      </Stack>

      <Button variant="ghost" size="small" icon={<IconSecondScreen />} onClick={handleOpenSecondScreen}>
        {t('openSecondScreen')}
      </Button>

      {
        user ? (
          <Button variant="ghost" size="small" icon={<ExitIcon />} onClick={handleLogout}>
            {t('signOut')}
          </Button>
        ) : (
          <Button variant="ghost" size="small" icon={<ExitIcon />} onClick={onSyncClick}>
            {t('signIn')}
          </Button>
        )
      }

    </Stack>
  );
}
