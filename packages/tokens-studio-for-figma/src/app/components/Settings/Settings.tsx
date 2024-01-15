/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { useTranslation } from 'react-i18next';
import {
  Box, Link, Text, Button, Heading, Label, Stack, Switch,
} from '@tokens-studio/ui';
import ignoreFirstPartImage from '@/app/assets/hints/ignoreFirstPartForStyles.png';
import prefixStylesImage from '@/app/assets/hints/prefixStyles.png';
import { track } from '@/utils/analytics';
import SyncSettings from '../SyncSettings';
import { LanguageSelector } from '../LanguageSelector';
import { Dispatch } from '../../store';
import {
  ignoreFirstPartForStylesSelector,
  storeTokenIdInJsonEditorSelector,
  prefixStylesWithThemeNameSelector,
  uiStateSelector,
} from '@/selectors';
import AddLicenseKey from '../AddLicenseKey/AddLicenseKey';
import { Divider } from '../Divider';
import OnboardingExplainer from '../OnboardingExplainer';
import RemConfiguration from '../RemConfiguration';
import { replay } from '@/app/sentry';
import { sessionRecordingSelector } from '@/selectors/sessionRecordingSelector';
import { useFlags } from '../LaunchDarkly';
import { ExplainerModal } from '../ExplainerModal';

function Settings() {
  const { t } = useTranslation(['settings']);

  const onboardingData = {
    title: t('whereTokensStored'),
    text: t('whereTokensStoredOnboarding'),
    url: 'https://docs.tokens.studio/sync/sync?ref=onboarding_explainer_syncproviders',
  };

  const ignoreFirstPartForStyles = useSelector(ignoreFirstPartForStylesSelector);
  const prefixStylesWithThemeName = useSelector(prefixStylesWithThemeNameSelector);
  const storeTokenIdInJsonEditor = useSelector(storeTokenIdInJsonEditorSelector);
  const uiState = useSelector(uiStateSelector);
  const dispatch = useDispatch<Dispatch>();
  const debugMode = useSelector(sessionRecordingSelector);
  const [debugSession, setDebugSession] = useState('');
  const { idStorage } = useFlags();

  const toggleDebugMode = React.useCallback(async (checked: CheckedState) => {
    dispatch.settings.setSessionRecording(!!checked);
    if (checked) {
      // Display the info to the user
      try {
        let id = await replay.getReplayId();
        if (!id) {
          // Force start the replay functionality
          replay.start();
          id = await replay.getReplayId();
        }
        setDebugSession(id || '');
      } catch (err) {
        console.warn('Replay is likely in progress already', err);
      }
    } else {
      try {
        replay.stop();
      } catch (err) {
        console.warn('Replay is likely stopped already', err);
      }
    }
  }, []);

  // Load once on mount.
  useEffect(() => {
    async function getSessionId() {
      try {
        const id = replay.getReplayId();
        setDebugSession(id || '');
      } catch (err) {
        // Silently fail
      }
    }
    getSessionId();
  });
  const handleIgnoreChange = React.useCallback(
    (state: CheckedState) => {
      track('setIgnoreFirstPartForStyles', { value: state });
      dispatch.settings.setIgnoreFirstPartForStyles(!!state);
    },
    [dispatch.settings],
  );

  const handlePrefixWithThemeNameChange = React.useCallback(
    (state: CheckedState) => {
      track('setPrefixStylesWithThemeName', { value: state });

      dispatch.settings.setPrefixStylesWithThemeName(!!state);
    },
    [dispatch.settings],
  );

  const handleStoreTokenIdInJsonEditorChange = React.useCallback(
    (state: CheckedState) => {
      track('setStoreTokenIdInJsonEditorSelector', { value: state });

      dispatch.settings.setStoreTokenIdInJsonEditorSelector(!!state);
    },
    [dispatch.settings],
  );

  const closeOnboarding = React.useCallback(() => {
    dispatch.uiState.setOnboardingExplainerSyncProviders(false);
  }, [dispatch]);

  const handleResetButton = React.useCallback(() => {
    dispatch.uiState.setOnboardingExplainerSets(true);
    dispatch.uiState.setOnboardingExplainerInspect(true);
    dispatch.uiState.setOnboardingExplainerSyncProviders(true);
    dispatch.uiState.setLastOpened(0);
  }, [dispatch]);

  return (
    <Box className="content scroll-container">
      <Stack direction="column" gap={4} css={{ padding: '$3 0' }}>
        <AddLicenseKey />
        <Divider />
        {uiState.onboardingExplainerSyncProviders && (
          <Stack direction="column" gap={2} css={{ padding: '$4' }}>
            <OnboardingExplainer data={onboardingData} closeOnboarding={closeOnboarding} />
          </Stack>
        )}
        <SyncSettings />
        <Divider />
        <Stack direction="column" align="start" gap={4} css={{ padding: '0 $4' }}>
          <Heading size="medium">{t('settings')}</Heading>
          <Stack
            direction="column"
            css={{
              border: '1px solid $borderSubtle',
              borderRadius: '$medium',
              padding: '$4',
              width: '100%',
            }}
          >
            <LanguageSelector />
          </Stack>
          <Stack
            direction="column"
            gap={4}
            css={{
              border: '1px solid $borderSubtle',
              borderRadius: '$medium',
              padding: '$4',
              width: '100%',
            }}
          >
            <Stack direction="row" gap={3} align="start" justify="between" css={{ width: '100%' }}>
              <Stack direction="column">
                <Stack direction="row" gap={1} align="center">
                  <Label htmlFor="ignoreFirstPartForStyles">{t('ignorePrefix')}</Label>
                  <ExplainerModal title={t('ignorePrefix')}>
                    <Box as="img" src={ignoreFirstPartImage} css={{ borderRadius: '$small' }} />
                    <Box>{t('usefulIgnore')}</Box>
                  </ExplainerModal>
                </Stack>
              </Stack>
              <Switch
                data-testid="ignoreFirstPartForStyles"
                id="ignoreFirstPartForStyles"
                checked={!!ignoreFirstPartForStyles}
                defaultChecked={ignoreFirstPartForStyles}
                onCheckedChange={handleIgnoreChange}
              />
            </Stack>
            <Stack direction="row" gap={3} align="start" justify="between" css={{ width: '100%' }}>
              <Stack direction="column">
                <Stack direction="row" gap={1} align="center">
                  <Label htmlFor="prefixStylesWithThemeName">{t('prefixStyles')}</Label>
                  <ExplainerModal title={t('prefixStyles')}>
                    <Box as="img" src={prefixStylesImage} css={{ borderRadius: '$small' }} />
                    <Box>{t('prefixStylesExplanation')}</Box>
                  </ExplainerModal>
                </Stack>
              </Stack>
              <Switch
                data-testid="prefixStylesWithThemeName"
                id="prefixStylesWithThemeName"
                checked={!!prefixStylesWithThemeName}
                defaultChecked={prefixStylesWithThemeName}
                onCheckedChange={handlePrefixWithThemeNameChange}
              />
            </Stack>
            {idStorage && (
              <Stack direction="row" gap={3} align="center" css={{ width: '100%' }}>
                <Label htmlFor="storeTokenIdInJsonEditor">{t('storeTokenId')}</Label>
                <Switch
                  id="storeTokenIdInJsonEditor"
                  checked={!!storeTokenIdInJsonEditor}
                  defaultChecked={storeTokenIdInJsonEditor}
                  onCheckedChange={handleStoreTokenIdInJsonEditorChange}
                />
              </Stack>
            )}
            <RemConfiguration />
          </Stack>
          <Stack
            direction="column"
            gap={4}
            css={{
              border: '1px solid $borderSubtle',
              borderRadius: '$medium',
              padding: '$4',
              width: '100%',
            }}
          >
            <Stack direction="row" justify="between" gap={2} align="center" css={{ width: '100%' }}>
              <Stack direction="column">
                <Stack direction="row" align="center" gap={1}>
                  <Label htmlFor="enableDebugging">{t('enableSessionRecording')}</Label>
                  <ExplainerModal title={t('enableSessionRecording')}>
                    <Box css={{
                      color: '$fgMuted',
                      fontSize: '$xsmall',
                    }}
                    >
                      {t('sessionRecordingDescription')}
                      {' '}
                      {t('dataCollectedIsAnonymised')}
                      {' '}
                      {t('forMoreInformationPleaseSeeOur')}
                      {' '}
                      <Link href="https://tokens.studio/privacy">{t('privacyPolicy')}</Link>
                    </Box>
                  </ExplainerModal>
                  <Box
                    css={{
                      color: '$fgMuted',
                      fontSize: '$xsmall',
                      lineHeight: 1.5,
                    }}
                  >
                    {debugSession && (
                    <Text>
                      {t('yourCurrentSessionIdIs')}
                      {' '}
                      <b>{debugSession}</b>
                    </Text>
                    )}
                  </Box>
                </Stack>
              </Stack>
              <Switch
                id="enableDebugging"
                checked={!!debugMode}
                defaultChecked={debugMode}
                onCheckedChange={toggleDebugMode}
              />
            </Stack>
            <Stack direction="row" justify="between" gap={2} align="center" css={{ width: '100%' }}>
              <Label>{t('resetOnboarding')}</Label>
              <Button variant="secondary" data-testid="reset-onboarding" onClick={handleResetButton}>
                {t('resetOnboarding')}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Settings;