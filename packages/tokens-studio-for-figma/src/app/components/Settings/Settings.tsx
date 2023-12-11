/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { useTranslation } from 'react-i18next';
import { Button } from '@tokens-studio/ui';
import { track } from '@/utils/analytics';
import SyncSettings from '../SyncSettings';
import { LanguageSelector } from '../LanguageSelector';
import Checkbox from '../Checkbox';
import Heading from '../Heading';
import { Dispatch } from '../../store';
import Label from '../Label';
import {
  ignoreFirstPartForStylesSelector, storeTokenIdInJsonEditorSelector, prefixStylesWithThemeNameSelector, uiStateSelector,
} from '@/selectors';
import Stack from '../Stack';
import Box from '../Box';
import AddLicenseKey from '../AddLicenseKey/AddLicenseKey';
import { Divider } from '../Divider';
import OnboardingExplainer from '../OnboardingExplainer';
import RemConfiguration from '../RemConfiguration';
import { replay } from '@/app/sentry';
import { sessionRecordingSelector } from '@/selectors/sessionRecordingSelector';
import Text from '../Text';
import Link from '../Link';
import { useDebug } from '@/app/store/useDebug';
import { useFlags } from '../LaunchDarkly';

function Settings() {
  const { t } = useTranslation(['settings']);

  const onboardingData = {
    title: t('whereTokensStored'),
    text: t('whereTokensStoredOnboarding'),
    url: 'https://docs.tokens.studio/sync/sync?ref=onboarding_explainer_syncproviders',
  };

  const { removeRelaunchData } = useDebug();
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

  const handleRemoveRelaunchData = React.useCallback(() => {
    removeRelaunchData();
  }, [removeRelaunchData]);

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
        <Stack direction="column" gap={3} css={{ padding: '0 $4' }}>
          <Heading size="medium">{t('settings')}</Heading>
          <Stack direction="row" gap={3} align="start">
            <Checkbox
              id="ignoreFirstPartForStyles"
              checked={!!ignoreFirstPartForStyles}
              defaultChecked={ignoreFirstPartForStyles}
              onCheckedChange={handleIgnoreChange}
            />
            <Label htmlFor="ignoreFirstPartForStyles">
              <Stack direction="column" gap={2}>
                <Box css={{ fontWeight: '$sansBold' }}>{t('ignorePrefix')}</Box>
                <Box css={{ color: '$fgMuted', fontSize: '$xsmall', lineHeight: 1.5 }}>
                  {t('usefulIgnore')}
                  {' '}
                  <code>colors</code>
                  {' '}
                  {t('inAToken')}
                  {' '}
                  <code>colors.blue.500</code>
                  {' '}
                  {t('forYourStyles')}
                </Box>
              </Stack>
            </Label>
          </Stack>
          <Stack direction="row" gap={3} align="start">
            <Checkbox
              id="prefixStylesWithThemeName"
              checked={!!prefixStylesWithThemeName}
              defaultChecked={prefixStylesWithThemeName}
              onCheckedChange={handlePrefixWithThemeNameChange}
            />

            <Label htmlFor="prefixStylesWithThemeName">
              <Stack direction="column" gap={2}>
                <Box css={{ fontWeight: '$sansBold' }}>{t('prefixStyles')}</Box>
                <Box css={{ color: '$fgMuted', fontSize: '$xsmall', lineHeight: 1.5 }}>{t('prefixStylesExplanation')}</Box>
              </Stack>
            </Label>
          </Stack>
          {idStorage
          && (
          <Stack direction="row" gap={3} align="start">
            <Checkbox
              id="storeTokenIdInJsonEditor"
              checked={!!storeTokenIdInJsonEditor}
              defaultChecked={storeTokenIdInJsonEditor}
              onCheckedChange={handleStoreTokenIdInJsonEditorChange}
            />

            <Label htmlFor="storeTokenIdInJsonEditor">
              <Stack direction="column" gap={2}>
                <Box css={{ fontWeight: '$sansBold' }}>{t('storeTokenId')}</Box>
                <Box css={{ color: '$textMuted', fontSize: '$xsmall', lineHeight: 1.5 }}>{t('storeTokenIdExplanation')}</Box>
              </Stack>
            </Label>
          </Stack>
          )}
          <Box>

            <Heading size="small">{t('baseFont')}</Heading>
            <Box css={{ color: '$fgMuted', fontSize: '$xsmall', lineHeight: 1.5 }}>
              {t('baseFontExplanation')}
            </Box>

          </Box>
          <RemConfiguration />
          <Stack direction="row" gap={2} align="center">
            <Heading size="small">{t('language')}</Heading>
            <LanguageSelector />
          </Stack>
        </Stack>
        <Divider />
        <Stack direction="column" gap={3} css={{ padding: '0 $4' }}>
          <Box>
            <Heading size="medium">{t('debugging')}</Heading>
            <Text muted css={{ fontSize: '$xsmall', lineHeight: 1.5 }}>
              {t('sessionRecordingDescription')}
              {' '}
              {t('dataCollectedIsAnonymised')}
              {' '}
              {t('forMoreInformationPleaseSeeOur')}
              {' '}
              <Link href="https://tokens.studio/privacy">{t('privacyPolicy')}</Link>
            </Text>
          </Box>
          <Stack direction="row" gap={2} align="center">
            <Checkbox
              id="enableDebugging"
              checked={!!debugMode}
              defaultChecked={debugMode}
              onCheckedChange={toggleDebugMode}
            />
            <Label htmlFor="enableDebugging">
              {t('enableSessionRecording')}
            </Label>
          </Stack>
          {debugSession && (
          <Text>
            {t('yourCurrentSessionIdIs')}
            {' '}
            <b>{debugSession}</b>
          </Text>
          )}
        </Stack>
      </Stack>
      <Stack direction="row" gap={2} css={{ padding: '$4' }}>
        <Button variant="secondary" size="small" data-testid="reset-onboarding" onClick={handleResetButton}>{t('resetOnboarding')}</Button>
        <Button variant="secondary" size="small" data-testid="reset-relaunch-data" onClick={handleRemoveRelaunchData}>{t('removeRelaunchData.button')}</Button>
      </Stack>
    </Box>
  );
}

export default Settings;
